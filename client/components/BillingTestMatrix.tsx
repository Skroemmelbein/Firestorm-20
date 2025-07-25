import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Zap,
  CreditCard,
  Target,
  BarChart3,
  TestTube,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestScenario {
  id: string;
  name: string;
  category: 'cit' | 'mit' | 'decline' | 'retry' | 'descriptor' | 'tokenization';
  description: string;
  expected_result: string;
  test_data: any;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  last_run?: string;
  duration?: number;
  error_message?: string;
}

export default function BillingTestMatrix() {
  const [testScenarios, setTestScenarios] = useState<TestScenario[]>([
    // CIT Tests
    {
      id: 'cit_success',
      name: 'CIT Success + Token Created',
      category: 'cit',
      description: 'Customer initiated transaction with successful vault token creation',
      expected_result: 'Transaction approved, vault token created, subscription activated',
      test_data: {
        card: { ccnumber: '4111111111111111', ccexp: '1225', cvv: '123', zip: '12345' },
        plan: 'plan_monthly_4999'
      },
      status: 'passed',
      last_run: '2024-01-15T10:30:00Z',
      duration: 2.5
    },
    {
      id: 'cit_decline',
      name: 'CIT Decline Handling',
      category: 'cit',
      description: 'Customer initiated transaction with card decline',
      expected_result: 'Transaction declined, no vault token created, appropriate error message',
      test_data: {
        card: { ccnumber: '4000000000000002', ccexp: '1225', cvv: '123', zip: '12345' },
        plan: 'plan_monthly_2999'
      },
      status: 'passed',
      last_run: '2024-01-15T10:32:00Z',
      duration: 1.8
    },

    // MIT Tests
    {
      id: 'mit_success',
      name: 'MIT Successful Charge',
      category: 'mit',
      description: 'Merchant initiated transaction using stored vault token',
      expected_result: 'Transaction approved, next billing date updated, retry count reset',
      test_data: {
        subscription_id: 123,
        vault_id: 'vault_test_001'
      },
      status: 'passed',
      last_run: '2024-01-15T10:35:00Z',
      duration: 1.9
    },
    {
      id: 'mit_insufficient_funds',
      name: 'MIT Insufficient Funds',
      category: 'mit',
      description: 'MIT transaction declined due to insufficient funds',
      expected_result: 'Transaction declined, retry scheduled, appropriate retry logic triggered',
      test_data: {
        subscription_id: 124,
        expected_decline: '51'
      },
      status: 'running',
      last_run: '2024-01-15T11:00:00Z'
    },

    // Decline Scenario Tests
    {
      id: 'decline_expired_card',
      name: 'Expired Card Detection',
      category: 'decline',
      description: 'Handle expired card decline and trigger card update flow',
      expected_result: 'Decline detected, card update required flag set, no retry scheduled',
      test_data: {
        response_code: '54',
        expected_action: 'update_card_required'
      },
      status: 'pending'
    },
    {
      id: 'decline_do_not_honor',
      name: 'Do Not Honor Retry Logic',
      category: 'decline',
      description: 'Test retry logic for soft decline (05 - Do not honor)',
      expected_result: 'Retry scheduled with descriptor variation, proper backoff timing',
      test_data: {
        response_code: '05',
        expected_retries: 3,
        expected_backoff: [12, 36, 72]
      },
      status: 'pending'
    },

    // Retry Tests
    {
      id: 'retry_backoff',
      name: 'Retry Backoff Timing',
      category: 'retry',
      description: 'Verify proper retry scheduling with exponential backoff',
      expected_result: 'Retries scheduled at 12h, 36h, 72h intervals',
      test_data: {
        backoff_hours: [12, 36, 72],
        max_retries: 3
      },
      status: 'pending'
    },
    {
      id: 'retry_max_reached',
      name: 'Max Retries Reached',
      category: 'retry',
      description: 'Test behavior when maximum retries are reached',
      expected_result: 'Subscription marked as past_due, no further retries scheduled',
      test_data: {
        current_retries: 3,
        max_retries: 3
      },
      status: 'pending'
    },

    // Descriptor Tests
    {
      id: 'descriptor_variation',
      name: 'Descriptor Variation',
      category: 'descriptor',
      description: 'Test descriptor changes for retry attempts',
      expected_result: 'Different descriptors used for each retry attempt',
      test_data: {
        base_descriptor: 'ECELONX Subscription',
        variations: [' Billing', ' Monthly', ' *Renew']
      },
      status: 'pending'
    },
    {
      id: 'descriptor_compliance',
      name: 'Descriptor Compliance',
      category: 'descriptor',
      description: 'Verify descriptor meets card brand requirements',
      expected_result: 'Descriptor is 22 characters or less, no special characters',
      test_data: {
        test_descriptors: ['ECELONX Subscription', 'ECELONX Sub *Renew', 'ECELONX Monthly']
      },
      status: 'passed',
      last_run: '2024-01-15T09:15:00Z',
      duration: 0.5
    },

    // Tokenization Tests
    {
      id: 'network_tokens',
      name: 'Network Token Creation',
      category: 'tokenization',
      description: 'Test network tokenization for eligible cards',
      expected_result: 'Network tokens created for Visa/MC cards, improved approval rates',
      test_data: {
        eligible_brands: ['visa', 'mastercard'],
        test_cards: ['4111111111111111', '5555555555554444']
      },
      status: 'pending'
    },
    {
      id: 'auto_card_updater',
      name: 'Automatic Card Updater',
      category: 'tokenization',
      description: 'Test automatic card updater for expired cards',
      expected_result: 'Expired card information automatically updated',
      test_data: {
        expired_cards: [
          { exp_month: 12, exp_year: 2023 },
          { exp_month: 1, exp_year: 2024 }
        ]
      },
      status: 'pending'
    }
  ]);

  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const categories = [
    { value: 'all', label: 'All Tests' },
    { value: 'cit', label: 'CIT Tests' },
    { value: 'mit', label: 'MIT Tests' },
    { value: 'decline', label: 'Decline Scenarios' },
    { value: 'retry', label: 'Retry Logic' },
    { value: 'descriptor', label: 'Descriptor Tests' },
    { value: 'tokenization', label: 'Tokenization' }
  ];

  const filteredScenarios = selectedCategory === 'all' 
    ? testScenarios 
    : testScenarios.filter(scenario => scenario.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      passed: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      failed: { variant: 'destructive' as const, className: '' },
      running: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800' },
      pending: { variant: 'outline' as const, className: '' },
      skipped: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const runSingleTest = async (testId: string) => {
    const test = testScenarios.find(t => t.id === testId);
    if (!test) return;

    setRunningTests(prev => new Set([...prev, testId]));

    try {
      console.log(`🧪 Running test: ${test.name}`);

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      // Simulate test result
      const success = Math.random() > 0.2; // 80% success rate for demo

      const result = {
        success,
        duration: Math.round((Math.random() * 5 + 1) * 100) / 100,
        timestamp: new Date().toISOString(),
        details: success 
          ? `✅ ${test.expected_result}`
          : `❌ Test failed: Unexpected response from payment processor`
      };

      setTestResults(prev => ({ ...prev, [testId]: result }));

      // Update test scenario status
      setTestScenarios(prev => prev.map(scenario => 
        scenario.id === testId 
          ? {
              ...scenario,
              status: success ? 'passed' : 'failed',
              last_run: result.timestamp,
              duration: result.duration,
              error_message: success ? undefined : result.details
            }
          : scenario
      ));

      console.log(`${success ? '✅' : '❌'} Test ${test.name} ${success ? 'passed' : 'failed'}`);

    } catch (error: any) {
      console.error(`💥 Test ${test.name} error:`, error);
      
      setTestScenarios(prev => prev.map(scenario => 
        scenario.id === testId 
          ? {
              ...scenario,
              status: 'failed',
              last_run: new Date().toISOString(),
              error_message: error.message
            }
          : scenario
      ));
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const runAllTests = async () => {
    const currentScenarios = selectedCategory === 'all' 
      ? testScenarios 
      : testScenarios.filter(s => s.category === selectedCategory);

    for (const scenario of currentScenarios) {
      if (scenario.status !== 'running') {
        await runSingleTest(scenario.id);
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const exportResults = () => {
    const results = {
      test_run: {
        timestamp: new Date().toISOString(),
        total_tests: testScenarios.length,
        passed: testScenarios.filter(t => t.status === 'passed').length,
        failed: testScenarios.filter(t => t.status === 'failed').length,
        pending: testScenarios.filter(t => t.status === 'pending').length
      },
      scenarios: testScenarios.map(scenario => ({
        ...scenario,
        result: testResults[scenario.id]
      }))
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-test-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getOverallStats = () => {
    const total = filteredScenarios.length;
    const passed = filteredScenarios.filter(s => s.status === 'passed').length;
    const failed = filteredScenarios.filter(s => s.status === 'failed').length;
    const running = filteredScenarios.filter(s => s.status === 'running').length;
    const pending = filteredScenarios.filter(s => s.status === 'pending').length;

    return { total, passed, failed, running, pending };
  };

  const stats = getOverallStats();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Test Matrix</h1>
          <p className="text-gray-600">Comprehensive QA testing for high-approval billing stack</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
          <Button onClick={runAllTests} disabled={runningTests.size > 0}>
            <Play className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            <div className="text-sm text-gray-600">Running</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredScenarios.length} of {testScenarios.length} tests
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Scenarios */}
      <div className="space-y-4">
        {filteredScenarios.map((scenario) => (
          <Card key={scenario.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(scenario.status)}
                    <h3 className="text-lg font-semibold">{scenario.name}</h3>
                    {getStatusBadge(scenario.status)}
                    <Badge variant="outline" className="text-xs">
                      {scenario.category.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{scenario.description}</p>
                  
                  <div className="text-sm space-y-1">
                    <div><strong>Expected:</strong> {scenario.expected_result}</div>
                    {scenario.last_run && (
                      <div className="flex items-center gap-4 text-gray-500">
                        <span>Last run: {new Date(scenario.last_run).toLocaleString()}</span>
                        {scenario.duration && <span>Duration: {scenario.duration}s</span>}
                      </div>
                    )}
                    {scenario.error_message && (
                      <div className="text-red-600 text-sm mt-2">
                        {scenario.error_message}
                      </div>
                    )}
                  </div>

                  {/* Test Data Preview */}
                  {scenario.test_data && (
                    <details className="mt-3">
                      <summary className="text-sm text-gray-500 cursor-pointer">View test data</summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(scenario.test_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => runSingleTest(scenario.id)}
                    disabled={runningTests.has(scenario.id) || scenario.status === 'running'}
                  >
                    {runningTests.has(scenario.id) ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Running
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Run Test
                      </>
                    )}
                  </Button>
                  
                  {testResults[scenario.id] && (
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  )}
                </div>
              </div>

              {/* Test Result Details */}
              {testResults[scenario.id] && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Latest Result:</h4>
                  <div className="text-sm space-y-1">
                    <div>Status: {testResults[scenario.id].success ? '✅ Passed' : '❌ Failed'}</div>
                    <div>Duration: {testResults[scenario.id].duration}s</div>
                    <div>Details: {testResults[scenario.id].details}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Test Actions
          </CardTitle>
          <CardDescription>
            Common testing scenarios for rapid validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CreditCard className="w-5 h-5" />
              <span>Test CIT Flow</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span>Test MIT Flow</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Test Declines</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Target className="w-5 h-5" />
              <span>Test Retries</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Configure testing environment and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Environment Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Test Mode:</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex justify-between">
                  <span>NMI Gateway:</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Xano Database:</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Test Cards:</span>
                  <Badge variant="outline">Available</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Test Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Max Retries:</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between">
                  <span>Retry Backoff:</span>
                  <span>12h, 36h, 72h</span>
                </div>
                <div className="flex justify-between">
                  <span>Descriptor Base:</span>
                  <span>ECELONX Subscription</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Tokens:</span>
                  <Badge variant="outline">Enabled</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
