"use client";

import { useForm } from "react-hook-form";
import type { FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType, ZodTypeDef } from "zod";

export function useZodForm<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues, ZodTypeDef, TFieldValues>,
  options?: UseFormProps<TFieldValues>
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    ...options,
  });
}
