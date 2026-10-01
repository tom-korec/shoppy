import { type FormEvent, useState } from 'react';
import type { z } from 'zod';
import { type FieldErrors, toFieldErrors } from '@/lib/form-errors';

type StringFields<T> = { [K in keyof T]: string };

export function useZodForm<S extends z.ZodObject>(
  schema: S,
  initialValues: StringFields<z.input<S>>,
  onValid: (values: z.output<S>, form: { reset: () => void }) => void,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  const field = (name: keyof z.input<S> & string) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event: { target: { value: string } }) => {
      setValues((current) => ({ ...current, [name]: event.target.value }));
      setErrors(({ [name]: _cleared, ...rest }) => rest);
    },
  });

  const reset = () => setValues(initialValues);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
    onValid(result.data, { reset });
  };

  return { field, handleSubmit, reset, values };
}
