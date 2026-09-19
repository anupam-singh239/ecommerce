import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });

        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="w-full">

      {/* Mobile Logo */}
      <div className="flex lg:hidden items-center gap-3 mb-10">
        <div className="w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Ecommerce
          </h2>

          <p className="text-xs text-slate-400">
            Online Store
          </p>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Signup
        </h1>

        <div className="mt-3 h-1 w-12 rounded-full bg-blue-600" />
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-1">
        <CommonForm
          formControls={registerFormControls}
          buttonText="Signup"
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
        />
      </div>

      {/* Login */}
      <div className="mt-7 text-center">
        <span className="text-sm text-slate-500">
          Already have an account?
        </span>

        <Link
          to="/auth/login"
          className="ml-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Login
        </Link>
      </div>

    </div>
  );
}

export default AuthRegister;