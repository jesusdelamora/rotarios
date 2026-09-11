import { LoginForm } from "./LoginForm";
import { Card } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Card>
        <h1 className="text-xl font-bold text-rotary-blue">Acceso para la directiva</h1>
        <p className="mt-1 text-sm text-rotary-gray">Ingresa el password del panel de resultados.</p>
        <LoginForm />
      </Card>
    </div>
  );
}
