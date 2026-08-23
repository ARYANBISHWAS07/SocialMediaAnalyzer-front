/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL || "http://3.6.187.53:8000",
    NEXT_PUBLIC_OLLAMA_BASE_URL:
      process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || process.env.VITE_OLLAMA_BASE_URL || "http://13.201.129.111:11434"
  },
  experimental: {
    useTypeScriptCli: false
  }
};

export default nextConfig;
