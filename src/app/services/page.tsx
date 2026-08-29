'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { ServiceCard, DependencyGraph } from '@/components/services';
import { LoadingState } from '@/components/ui';
import { getServices } from '@/lib/api';
import { Service } from '@/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Services">
        <LoadingState />
      </Layout>
    );
  }

  const criticalServices = services.filter((s) => s.health === 'critical');
  const degradedServices = services.filter((s) => s.health === 'degraded');
  const healthyServices = services.filter((s) => s.health === 'healthy');

  return (
    <Layout
      title="Services"
      subtitle="Service health, performance metrics, and dependencies"
    >
      <div className="space-y-8">
        {/* Dependency Graph */}
        <DependencyGraph services={services} />

        {/* Service Cards by Health */}
        {criticalServices.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">🔴 Critical Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {criticalServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        )}

        {degradedServices.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">🟡 Degraded Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {degradedServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        )}

        {healthyServices.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">🟢 Healthy Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthyServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
