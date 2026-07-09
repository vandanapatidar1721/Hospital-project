import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hospital, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 p-8">
        <div className="relative w-full overflow-hidden rounded-2xl bg-primary-900 text-white shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=80"
            alt="Modern hospital corridor"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-primary-950/80" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3">
                <Hospital className="w-9 h-9" />
              </div>
              <div>
                <span className="block text-2xl font-bold">Hospital Management</span>
                <span className="text-sm text-primary-100">Secure digital care platform</span>
              </div>
            </div>

            <div className="max-w-xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
                Trusted healthcare workspace
              </span>
              <h2 className="mt-6 text-5xl font-bold leading-tight">Digitize hospital operations beautifully.</h2>
              <p className="mt-5 text-primary-100 text-lg leading-relaxed">
                Manage patients, appointments, prescriptions, doctors, departments, and billing from one clean dashboard.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-xs text-primary-100">Care access</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-primary-100">Digital records</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-2xl font-bold">Fast</p>
                <p className="text-xs text-primary-100">Workflow</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md rounded-xl bg-white p-5 sm:p-8 shadow-xl ring-1 ring-gray-100">
          <div className="lg:hidden flex items-center gap-3 mb-6 sm:mb-8">
            <Hospital className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Hospital Login</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-6 sm:mb-8">Sign in with your email and password</p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 min-h-11 min-w-11 inline-flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:underline">
              Sign up as a patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
