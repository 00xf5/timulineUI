import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [domain, setDomain] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      navigate(`/timeline/${domain.trim()}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>RiskSignal Timeline | Security Drift Detection</title>
        <meta name="description" content="Analyze the security drift and attack surface history of any domain. Get real-time forensic insights into exposed secrets, API changes, and infrastructure modifications." />
        <link rel="canonical" href="https://app.risksignal.com/" />
        <meta property="og:title" content="RiskSignal Timeline | Security Drift Detection" />
        <meta property="og:description" content="Analyze the security drift and attack surface history of any domain. Get real-time forensic insights." />
        <meta property="og:url" content="https://app.risksignal.com/" />
        <meta property="og:image" content="https://app.risksignal.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@RiskSignal" />
        <meta name="twitter:image" content="https://app.risksignal.com/og-image.png" />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 text-center p-4">
        <Shield className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold">RiskSignal Timeline</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Enter a domain to begin a forensic analysis of its attack surface history.
        </p>
      </div>
      <form onSubmit={handleSearch} className="w-full max-w-lg mt-8 px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g., example.com"
            className="w-full pl-10 h-12 text-lg rounded-lg shadow-sm"
          />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4">
            Search
          </Button>
        </div>
      </form>
      </div>
    </>
  );
};

export default Index;
