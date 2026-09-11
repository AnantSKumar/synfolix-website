import { useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";
import NavBar from "../components/NavBar";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/leads").then((data) => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <NavBar />
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Leads</h1>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Company</th>
              <th className="py-2">Email</th>
              <th className="py-2">Industry</th>
              <th className="py-2">Timeline</th>
              <th className="py-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b align-top">
                <td className="py-2">{lead.name}</td>
                <td className="py-2">{lead.company || "—"}</td>
                <td className="py-2">{lead.email}</td>
                <td className="py-2">{lead.industry || "—"}</td>
                <td className="py-2">{lead.timeline || "—"}</td>
                <td className="py-2">{new Date(lead.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <p className="text-slate-500 mt-4">No leads yet.</p>}
      </div>
    </>
  );
}
