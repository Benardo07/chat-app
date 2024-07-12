"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from "~/trpc/react"; // Adjust the import path based on your project structure

type Errors = {
  email?: string;
  password?: string;
  name?: string;
  accountId?: string;
};

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const registerUser = api.user.register.useMutation();

  const validateForm = (): boolean => {
    let tempErrors: Errors = {};
    if (!email.includes('@')) {
      tempErrors.email = 'Invalid email address';
    }
    if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters long';
    }
    if (name.length < 3) {
      tempErrors.name = 'Name must be at least 3 characters long';
    }
    if (!accountId) {
      tempErrors.accountId = 'Account ID is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return; // Stop the submission if there are errors
    setLoading(true);
    try {
      const newUser = await registerUser.mutateAsync({ email, password, name, accountId });
      console.log('User registered:', newUser); // Redirect or handle post-registration
      router.push('/login')
    } catch (err) {
      console.error('Failed to register:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-[500px] w-3/4 border-2 rounded-3xl flex flex-col items-center pb-10">
      <h1 className="text-3xl italic text-green-600 font-bold my-6 w-full text-center">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full flex flex-col gap-4 px-5 items-center">
        <div className='w-full'>
          <label htmlFor="name" className="block mb-2 font-bold">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input input-bordered w-full  border-2 rounded-2xl px-5 py-3"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className='w-full'>
          <label htmlFor="accountId" className="block mb-2 font-bold">Account ID:</label>
          <input
            type="text"
            id="accountId"
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
            className="input input-bordered w-full  border-2 rounded-2xl px-5 py-3"
          />
          {errors.accountId && <p className="text-red-500 text-sm">{errors.accountId}</p>}
        </div>
        <div className='w-full'>
          <label htmlFor="email" className="block mb-2 font-bold">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input input-bordered w-full border-2 rounded-2xl px-5 py-3"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div className='w-full'>
          <label htmlFor="password" className="block mb-2 font-bold">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input input-bordered w-full border-2 rounded-2xl px-5 py-3"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <button type="submit" className="px-5 py-3 bg-[#19cc64] font-bold hover:bg-green-800 rounded-full max-w-32" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;
