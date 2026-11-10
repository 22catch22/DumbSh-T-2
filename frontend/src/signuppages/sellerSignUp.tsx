<div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
  <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
    <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Create Account</h2>
    
    <form className="flex flex-col gap-4">
      {/* Seller Name Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
        <input
          type="text"
          placeholder="Type your seller name"
          className="w-full h-10 border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          placeholder="email address"
          className="w-full h-10 border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="password"
          className="w-full h-10 border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
        <input
          type="password"
          className="w-full h-10 border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 rounded-md transition mt-2"
      >
        Sign Up!
      </button>
    </form>
  </div>
</div>