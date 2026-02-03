import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AddKeywordForm = {
  phrase: string;
  targetUrl: string;
  locale: string;
  device: string;
  notes: string;
};

export type AddKeywordCardProps = {
  form: AddKeywordForm;
  setForm: (value: AddKeywordForm) => void;
  onSubmit: () => void;
  canSubmit: boolean;
};

export const AddKeywordCard = ({ form, setForm, onSubmit, canSubmit }: AddKeywordCardProps) => {
  return (
    <Card className="border-[var(--line)] bg-white shadow-[var(--shadow)]">
      <CardHeader className="pb-0">
        <CardTitle className="text-base !text-[var(--ink)]">Thêm keyword</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[2fr_2fr_1fr_1fr]">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Keyword
            <Input
              placeholder="Spa da nang"
              value={form.phrase}
              onChange={(event) => setForm({ ...form, phrase: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Target URL
            <Input
              placeholder="https://..."
              value={form.targetUrl}
              onChange={(event) => setForm({ ...form, targetUrl: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Locale
            <select
              className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
              value={form.locale}
              onChange={(event) => setForm({ ...form, locale: event.target.value })}
            >
              <option value="vi-VN">vi-VN</option>
              <option value="en-US">en-US</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
            Device
            <select
              className="h-11 rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)]"
              value={form.device}
              onChange={(event) => setForm({ ...form, device: event.target.value })}
            >
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--ink-muted)]">
          Notes
          <Input
            placeholder="Ghi chú mục tiêu..."
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </label>
        <Button disabled={!canSubmit} onClick={onSubmit}>
          Add keyword
        </Button>
      </CardContent>
    </Card>
  );
};
