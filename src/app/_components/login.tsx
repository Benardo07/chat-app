"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from "~/trpc/react"; // Adjust the import path based on your project structure
import { signIn } from 'next-auth/react';

type LoginErrors = {
  email?: string;
  password?: string;
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setLoading] = useState<boolean>(false);
  const router = useRouter();
 
  const validateForm = (): boolean => {
    let tempErrors: LoginErrors = {};
    if (!email.includes('@')) {
      tempErrors.email = 'Please enter a valid email address.';
    }
    if (password.length === 0) {
      tempErrors.password = 'Password cannot be empty.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return; // Stop the submission if there are errors
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if(result?.ok){
        console.log("succes sign in" , result)
        router.push('/');
      }else{
        throw new Error("failed");
      }
      
       // Redirect to dashboard or home page
    } catch (err) {
      console.error('Failed to login:', err);
      setErrors({ email: 'Failed to login with provided credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-[500px] w-3/4 border-2 rounded-3xl flex flex-col items-center pb-10">
      <h1 className="text-3xl italic text-green-600 font-bold my-6 w-full text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full flex flex-col gap-4 px-5 items-center">
        <div className='w-full'>
          <label htmlFor="email" className="block mb-2 font-bold">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="input input-bordered w-full border-2 rounded-2xl px-5 py-3"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div  className='w-full'>
          <label htmlFor="password" className="block mb-2 font-bold">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="input input-bordered w-full border-2 rounded-2xl px-5 py-3"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <button type="submit" className="px-5 py-3 bg-[#19cc64] font-bold hover:bg-green-800 rounded-full max-w-32" disabled={isLoading}>
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
