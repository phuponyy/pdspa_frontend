"use client";

import { useForm } from "react-hook-form";
import type { FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

export function useZodForm<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options?: UseFormProps<z.infer<TSchema>>
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    ...options,
  });
}
