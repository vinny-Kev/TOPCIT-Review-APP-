import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  name: string;
}

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const { login, register: registerUser } = useAuth();
  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  const title = useMemo(() => (mode === 'login' ? 'Welcome back' : 'Create your account'), [mode]);

  const onSubmit = async (values: RegisterForm) => {
    setError(null);
    try {
      if (mode === 'login') {
        await login({ email: values.email, password: values.password });
      } else {
        await registerUser({ name: values.name, email: values.email, password: values.password });
      }
      reset();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="auth-shell">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-header">
          <h1>{title}</h1>
          <p>TOPCIT Review App</p>
        </div>
        <div className="auth-toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {mode === 'register' && (
            <label>
              <span>Name</span>
              <input type="text" placeholder="Jane Doe" {...formRegister('name', { required: true })} />
            </label>
          )}
          <label>
            <span>Email</span>
            <input type="email" placeholder="you@example.com" {...formRegister('email', { required: true })} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="••••••••" {...formRegister('password', { required: true, minLength: 6 })} />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthPage;
