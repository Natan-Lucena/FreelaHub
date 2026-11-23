import { Navigate, Route, Routes } from 'react-router-dom';
import { RotaProtegida } from './auth/RotaProtegida';
import { Cadastro } from './pages/Cadastro';
import { Inicio } from './pages/Inicio';
import { Login } from './pages/Login';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route element={<RotaProtegida />}>
        {/* As telas protegidas das demais fatias entram aqui. */}
        <Route path="/" element={<Inicio />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
