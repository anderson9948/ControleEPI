"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  addDoc,
  deleteDoc
} from "firebase/firestore";
import { FaTrash } from "react-icons/fa";

// Funções utilitárias
function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function daysBetween(date1: Date, date2: Date) {
  const diff = date1.getTime() - date2.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
function getStatus(validUntil: Date, today: Date) {
  const days = daysBetween(validUntil, today);
  if (days < 0) return "CRITICO";
  if (days <= 10) return "INICIAR TROCA";
  return "OK";
}
function getStatusColor(status: string) {
  if (status === "OK") return "green";
  if (status === "INICIAR TROCA") return "orange";
  return "red";
}

const COLLECTION = "colaboradores_protetor_auditivo";

export default function ProtetorAuditivoPage() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoje, setHoje] = useState(new Date());

  // Campos do novo colaborador
  const [novoNome, setNovoNome] = useState("");
  const [novoSetor, setNovoSetor] = useState("");
  const [novoTipo, setNovoTipo] = useState("plug");

  // Atualiza a data atual a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setHoje(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  // Carregar dados do Firestore
  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, COLLECTION));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setColaboradores(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Atualizar data no Firestore
  const handleDateChange = async (id: string, value: string) => {
    const newColabs = colaboradores.map((c) =>
      c.id === id ? { ...c, ultimaRequisicao: value } : c
    );
    setColaboradores(newColabs);

    await updateDoc(doc(db, COLLECTION, id), { ultimaRequisicao: value });
  };

  // Adicionar novo colaborador
  const handleAddColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoSetor.trim() || !novoTipo.trim()) return;

    const hojeStr = hoje.toISOString().split("T")[0];
    const novoColab = {
      nome: novoNome,
      setor: novoSetor,
      tipo: novoTipo,
      ultimaRequisicao: hojeStr,
      statusColaborador: "Trabalhando" // status padrão
    };
    const docRef = await addDoc(collection(db, COLLECTION), novoColab);
    setColaboradores([
      ...colaboradores,
      { ...novoColab, id: docRef.id }
    ]);
    setNovoNome("");
    setNovoSetor("");
    setNovoTipo("plug");
  };

  // Função para excluir colaborador
  const handleDeleteColaborador = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
    setColaboradores(colaboradores.filter(colab => colab.id !== id));
  };

  // Função para atualizar status do colaborador (corrigida para usar id, não idx)
  const handleStatusChange = async (id: string, value: string) => {
    const newColabs = colaboradores.map((c) =>
      c.id === id ? { ...c, statusColaborador: value } : c
    );
    setColaboradores(newColabs);

    await updateDoc(doc(db, COLLECTION, id), { statusColaborador: value });
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8 bg-white text-black">
      <h2 className="text-2xl font-bold mb-2">Controle de EPI - Protetor auditivo</h2>
      <h3 className="text-base font-medium mb-4 text-gray-600">Validade de 6 meses</h3>
      {/* Formulário de novo colaborador */}
      <form
        onSubmit={handleAddColaborador}
        className="flex flex-row gap-2 mb-4 flex-wrap items-end"
      >
        <div>
          <label className="block text-xs font-semibold">Nome</label>
          <input
            type="text"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
            className="border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold">Setor</label>
          <input
            type="text"
            value={novoSetor}
            onChange={e => setNovoSetor(e.target.value)}
            className="border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold">Tipo</label>
          <select
            value={novoTipo}
            onChange={e => setNovoTipo(e.target.value)}
            className="border rounded px-2 py-1 w-[200px] h-[34px]"
            required
          >
            <option value="plug">Plug</option>
            <option value="concha">Concha</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-800"
        >
          Adicionar
        </button>
      </form>

      <table className="min-w-full border border-gray-300 rounded shadow text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 border font-semibold">Colaborador</th>
            <th className="px-3 py-2 border font-semibold">Setor</th>
            <th className="px-3 py-2 border font-semibold">Tipo</th>
            <th className="px-3 py-2 border font-semibold">Última Requisição</th>
            <th className="px-3 py-2 border font-semibold">Válido Até</th>
            <th className="px-3 py-2 border font-semibold">Dias Restantes</th>
            <th className="px-3 py-2 border font-semibold">Status</th>
            <th className="px-3 py-2 border font-semibold">Status Colaborador</th>
            <th className="px-2 py-2 border font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {[...colaboradores]
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
            .map((colab) => {
              const ultima = colab.ultimaRequisicao && colab.ultimaRequisicao.length >= 10
                ? colab.ultimaRequisicao.slice(0, 10)
                : "";
              const validoAte = addMonths(new Date(ultima), 6);
              const diasRestantes = ultima ? daysBetween(validoAte, hoje) : "";
              const status = ultima ? getStatus(validoAte, hoje) : "";
              const statusColor = ultima ? getStatusColor(status) : "black";
              let statusColabColor = "black";
              if (colab.statusColaborador === "Trabalhando") statusColabColor = "green";
              else if (colab.statusColaborador === "afastado" || colab.statusColaborador === "recluso") statusColabColor = "red";
              else if (colab.statusColaborador === "licença") statusColabColor = "orange";

              // Corrija o value do select para garantir que seja string e não undefined
              const statusColabValue =
                typeof colab.statusColaborador === "string"
                  ? colab.statusColaborador
                  : "";

              return (
                <tr key={colab.id} className="text-center">
                  <td className="border px-2 py-1">{colab.nome}</td>
                  <td className="border px-2 py-1">{colab.setor}</td>
                  <td className="border px-2 py-1">{colab.tipo || ""}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="date"
                      value={ultima}
                      onChange={e => handleDateChange(colab.id, e.target.value)}
                      className="border rounded px-1 py-0.5"
                      maxLength={10}
                    />
                  </td>
                  <td className="border px-2 py-1">{ultima ? validoAte.toLocaleDateString() : ""}</td>
                  <td className="border px-2 py-1">{diasRestantes}</td>
                  <td
                    className="border px-2 py-1 font-bold"
                    style={{
                      color: statusColor
                    }}
                  >
                    {status}
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      value={statusColabValue}
                      onChange={e => handleStatusChange(colab.id, e.target.value)}
                      className="border rounded px-2 py-1 w-[120px] h-[28px]"
                      style={{ color: statusColabColor, fontWeight: "bold" }}
                    >
                      <option value="">Selecione</option>
                      <option value="Trabalhando">Trabalhando</option>
                      <option value="afastado">Afastado</option>
                      <option value="recluso">Recluso</option>
                      <option value="licença">Licença</option>
                    </select>
                  </td>
                  <td
                    className="border px-1 py-1"
                    style={{ width: 32, textAlign: "center" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleDeleteColaborador(colab.id)}
                      className="p-0 m-0 bg-transparent border-none"
                      title="Excluir"
                    >
                      <FaTrash size={14} color="#d32f2f" />
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}