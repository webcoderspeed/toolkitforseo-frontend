'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle, Clock, Globe, Lock, Key, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SSLCertificate {
  subject: {
    common_name: string;
    organization: string;
    organizational_unit: string;
    locality: string;
    state: string;
    country: string;
  };
  issuer: {
    common_name: string;
    organization: string;
    country: string;
  };
  validity: {
    not_before: string;
    not_after: string;
    days_remaining: number;
    is_expired: boolean;
    is_valid: boolean;
  };
  fingerprints: {
    sha1: string;
    sha256: string;
    md5: string;
  };
  public_key: {
    algorithm: string;
    size: number;
    exponent: string;
  };
  signature_algorithm: string;
  version: number;
  serial_number: string;
  extensions: {
    subject_alternative_names: string[];
    key_usage: string[];
    extended_key_usage: string[];
    basic_constraints: string;
    authority_key_identifier: string;
    subject_key_identifier: string;
  };
}

interface SSLAnalysis {
  domain: string;
  port: number;
  ssl_enabled: boolean;
  certificate: SSLCertificate;
  security_analysis: {
    overall_grade: string;
    protocol_support: {
      tls_1_0: boolean;
      tls_1_1: boolean;
      tls_1_2: boolean;
      tls_1_3: boolean;
      ssl_3_0: boolean;
      ssl_2_0: boolean;
    };
    cipher_suites: Array<{
      name: string;
      strength: string;
      key_exchange: string;
      authentication: string;
      encryption: string;
      mac: string;
    }>;
    vulnerabilities: Array<{
      name: string;
      severity: string;
      description: string;
      recommendation: string;
    }>;
    hsts: {
      enabled: boolean;
      max_age: number;
      include_subdomains: boolean;
      preload: boolean;
    };
    certificate_transparency: {
      enabled: boolean;
      logs_count: number;
    };
    ocsp_stapling: {
      enabled: boolean;
      status: string;
    };
  };
  chain_analysis: {
    chain_length: number;
    root_ca: string;
    intermediate_cas: string[];
    chain_issues: string[];
    trusted: boolean;
  };
  performance: {
    handshake_time: number;
    connection_time: number;
    total_time: number;
  };
  recommendations: Array<{
    category: string;
    priority: string;
    issue: string;
    solution: string;
  }>;
  compliance: {
    pci_dss: boolean;
    hipaa: boolean;
    gdpr: boolean;
    fips_140_2: boolean;
  };
}

export default function SSLChecker() {
  const [domain, setDomain] = useState('');
  const [port, setPort] = useState('443');
  const [result, setResult] = useState<SSLAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState<'gemini' | 'openai'>('gemini');

  const checkSSL = async () => {
    if (!domain) {
      toast.error('Domain is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ssl-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain.replace(/^https?:\/\//, ''),
          port: parseInt(port),
          vendor
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check SSL certificate');
      }

      const data = await response.json();
      setResult(data);
      toast.success('SSL certificate analyzed successfully!');
    } catch (error) {
      console.error('Error checking SSL:', error);
      toast.error('Failed to check SSL certificate');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
        return 'default';
      case 'B':
        return 'secondary';
      case 'C':
        return 'outline';
      case 'D':
      case 'F':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">
              SSL Certificate Checker
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Analyze SSL certificates, security protocols, and get detailed security recommendations for your website's security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  SSL Analysis
                </CardTitle>
                <CardDescription>
                  Enter domain to analyze SSL certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vendor">AI Vendor</Label>
                  <Select value={vendor} onValueChange={(value: 'gemini' | 'openai') => setVendor(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Gemini</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="domain">Domain *</Label>
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="port">Port</Label>
                  <Select value={port} onValueChange={setPort}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="443">443 (HTTPS)</SelectItem>
                      <SelectItem value="993">993 (IMAPS)</SelectItem>
                      <SelectItem value="995">995 (POP3S)</SelectItem>
                      <SelectItem value="465">465 (SMTPS)</SelectItem>
                      <SelectItem value="587">587 (SMTP TLS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={checkSSL} 
                  disabled={loading || !domain}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Analyzing...' : 'Check SSL Certificate'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {result && (
              <div className="space-y-6">
                {/* Overview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {result.ssl_enabled ? (
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                        ) : (
                          <ShieldX className="h-5 w-5 text-red-600" />
                        )}
                        SSL Certificate Status
                      </span>
                      <Badge variant={getGradeBadgeVariant(result.security_analysis.overall_grade)}>
                        Grade: {result.security_analysis.overall_grade}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          {result.certificate.validity.is_valid ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                          )}
                        </div>
                        <div className="font-semibold">
                          {result.certificate.validity.is_valid ? 'Valid' : 'Invalid'}
                        </div>
                        <div className="text-sm text-gray-600">Certificate Status</div>
                      </div>

                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="font-semibold">
                          {result.certificate.validity.days_remaining} days
                        </div>
                        <div className="text-sm text-gray-600">Until Expiry</div>
                      </div>

                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Globe className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="font-semibold">
                          {result.chain_analysis.trusted ? 'Trusted' : 'Untrusted'}
                        </div>
                        <div className="text-sm text-gray-600">Certificate Chain</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="certificate" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="certificate">Certificate</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="protocols">Protocols</TabsTrigger>
                        <TabsTrigger value="chain">Chain</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                      </TabsList>

                      <TabsContent value="certificate" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Subject Information</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">Common Name:</span> {result.certificate.subject.common_name}</div>
                              <div><span className="font-medium">Organization:</span> {result.certificate.subject.organization}</div>
                              <div><span className="font-medium">Country:</span> {result.certificate.subject.country}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Issuer Information</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">CA:</span> {result.certificate.issuer.common_name}</div>
                              <div><span className="font-medium">Organization:</span> {result.certificate.issuer.organization}</div>
                              <div><span className="font-medium">Country:</span> {result.certificate.issuer.country}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Validity Period</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">Valid From:</span> {formatDate(result.certificate.validity.not_before)}</div>
                              <div><span className="font-medium">Valid Until:</span> {formatDate(result.certificate.validity.not_after)}</div>
                              <div><span className="font-medium">Days Remaining:</span> 
                                <Badge variant={result.certificate.validity.days_remaining > 30 ? "default" : "destructive"} className="ml-2">
                                  {result.certificate.validity.days_remaining}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Technical Details</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">Algorithm:</span> {result.certificate.signature_algorithm}</div>
                              <div><span className="font-medium">Key Size:</span> {result.certificate.public_key.size} bits</div>
                              <div><span className="font-medium">Serial:</span> {result.certificate.serial_number}</div>
                            </div>
                          </div>
                        </div>

                        {result.certificate.extensions.subject_alternative_names.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Subject Alternative Names</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.certificate.extensions.subject_alternative_names.map((san, index) => (
                                <Badge key={index} variant="outline">{san}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="security" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Security Features</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span>HSTS</span>
                                {result.security_analysis.hsts.enabled ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Certificate Transparency</span>
                                {result.security_analysis.certificate_transparency.enabled ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span>OCSP Stapling</span>
                                {result.security_analysis.ocsp_stapling.enabled ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Performance</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">Handshake Time:</span> {result.performance.handshake_time}ms</div>
                              <div><span className="font-medium">Connection Time:</span> {result.performance.connection_time}ms</div>
                              <div><span className="font-medium">Total Time:</span> {result.performance.total_time}ms</div>
                            </div>
                          </div>
                        </div>

                        {result.security_analysis.vulnerabilities.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Vulnerabilities</h4>
                            <div className="space-y-2">
                              {result.security_analysis.vulnerabilities.map((vuln, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{vuln.name}</span>
                                    <Badge variant={vuln.severity === 'high' ? 'destructive' : vuln.severity === 'medium' ? 'secondary' : 'outline'}>
                                      {vuln.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{vuln.description}</p>
                                  <p className="text-sm font-medium">Recommendation: {vuln.recommendation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="protocols" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Protocol Support</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(result.security_analysis.protocol_support).map(([protocol, supported]) => (
                              <div key={protocol} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium">{protocol.replace(/_/g, ' ').toUpperCase()}</span>
                                {supported ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Cipher Suites</h4>
                          <div className="space-y-2">
                            {result.security_analysis.cipher_suites.slice(0, 5).map((cipher, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{cipher.name}</span>
                                  <Badge variant={cipher.strength === 'strong' ? 'default' : cipher.strength === 'weak' ? 'destructive' : 'secondary'}>
                                    {cipher.strength}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {cipher.key_exchange} | {cipher.authentication} | {cipher.encryption}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="chain" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Certificate Chain</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span>Chain Length</span>
                              <Badge>{result.chain_analysis.chain_length}</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span>Root CA</span>
                              <span className="text-sm">{result.chain_analysis.root_ca}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span>Trusted</span>
                              {result.chain_analysis.trusted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>

                          {result.chain_analysis.intermediate_cas.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Intermediate CAs</h5>
                              <div className="space-y-1">
                                {result.chain_analysis.intermediate_cas.map((ca, index) => (
                                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                    {ca}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.chain_analysis.chain_issues.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Chain Issues</h5>
                              <div className="space-y-1">
                                {result.chain_analysis.chain_issues.map((issue, index) => (
                                  <div key={index} className="text-sm p-2 bg-red-50 text-red-700 rounded">
                                    {issue}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="compliance" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Compliance Standards</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(result.compliance).map(([standard, compliant]) => (
                              <div key={standard} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">{standard.replace(/_/g, ' ').toUpperCase()}</span>
                                {compliant ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Security Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.recommendations.map((rec, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{rec.category}</span>
                              <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Issue:</strong> {rec.issue}
                            </div>
                            <div className="text-sm">
                              <strong>Solution:</strong> {rec.solution}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}