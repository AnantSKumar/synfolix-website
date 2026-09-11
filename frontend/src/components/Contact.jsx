import { useState } from "react";
import { apiFetch } from "../lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const emptyForm = {
  name: "", company: "", email: "", phone: "", industry: "",
  projectDescription: "", budget: "", timeline: "", message: "",
};

const fields = [
  { key: "name", label: "Name", required: true },
  { key: "company", label: "Company" },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone" },
  { key: "industry", label: "Industry" },
  { key: "timeline", label: "Timeline" },
];

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
    <section id="contact" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="mb-4 text-center text-3xl font-bold text-foreground">Build With Synfolix</h2>
      <p className="mb-10 text-center text-muted-foreground">
        Tell us what you're building — we'll get back to you.
      </p>

      {status === "success" ? (
        <Card className="items-center py-10 text-center">
          <CardContent className="text-primary">
            Thanks — we've received your message and will be in touch soon.
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className="grid gap-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type || "text"}
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                required={field.required}
              />
            </div>
          ))}

          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="budget">Estimated budget (optional)</Label>
            <Input
              id="budget"
              value={form.budget}
              onChange={(e) => handleChange("budget", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="projectDescription">What do you want to build?</Label>
            <Textarea
              id="projectDescription"
              rows={3}
              value={form.projectDescription}
              onChange={(e) => handleChange("projectDescription", e.target.value)}
            />
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={3}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-destructive md:col-span-2">{errorMessage}</p>
          )}

          <Button type="submit" size="lg" disabled={status === "submitting"} className="rounded-full md:col-span-2">
            {status === "submitting" ? "Sending..." : "Build With Synfolix"}
          </Button>
        </form>
      )}

      <div className="mt-10 flex justify-center gap-4 text-center text-sm text-muted-foreground">
        <span>hello@synfolix.com</span>
        <span>·</span>
        <span>+91 00000 00000</span>
      </div>
    </section>
  );
}
