import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

const emptyForm = {
  name: "", company: "", email: "", phone: "", industry: "",
  projectDescription: "", budget: "", timeline: "", message: "",
};

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      await apiFetch("/leads", { method: "POST", body: JSON.stringify(form) });
      setStatus("success");
      setForm(emptyForm);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <section id="contact" className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Build With Synfolix</h2>
      <p className="text-slate-600 text-center mb-10">
        Tell us what you're building — we'll get back to you.
      </p>

      {status === "success" ? (
        <p className="text-center text-green-700 bg-green-50 border border-green-200 rounded-xl py-6">
          Thanks — we've received your message and will be in touch soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Company"
            value={form.company}
            onChange={(e) => handleChange("company", e.target.value)}
          />
          <input
            type="email"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Industry"
            value={form.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Timeline"
            value={form.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 text-sm md:col-span-2"
            placeholder="Estimated budget (optional)"
            value={form.budget}
            onChange={(e) => handleChange("budget", e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2 text-sm md:col-span-2"
            placeholder="What do you want to build?"
            rows={3}
            value={form.projectDescription}
            onChange={(e) => handleChange("projectDescription", e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2 text-sm md:col-span-2"
            placeholder="Message"
            rows={3}
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
          />

          {status === "error" && (
            <p className="md:col-span-2 text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="md:col-span-2 bg-slate-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-slate-700 disabled:opacity-50"
          >
            {status === "submitting" ? "Sending..." : "Build With Synfolix"}
          </button>
        </form>
      )}

      <div className="mt-10 text-center text-sm text-slate-500 space-x-4">
        <span>hello@synfolix.com</span>
        <span>·</span>
        <span>+91 00000 00000</span>
      </div>
    </section>
  );
}
