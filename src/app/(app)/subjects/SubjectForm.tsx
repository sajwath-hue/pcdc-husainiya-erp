"use client";

import { useActionState, useRef, useEffect } from "react";
import { Input, SubmitButton, FormError } from "@/components/ui/Form";
import { createSubjectAction, type FormState } from "./actions";

const initialState: FormState = { error: null };

export function SubjectForm() {
  const [state, formAction] = useActionState(createSubjectAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-start gap-3">
      <Input name="name" required placeholder="e.g. Arabic Grammar" className="max-w-xs" />
      <SubmitButton>Add subject</SubmitButton>
      <FormError error={state.error} />
    </form>
  );
}
