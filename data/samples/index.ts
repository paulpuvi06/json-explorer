/**
 * Sample Dataset Metadata and Types
 *
 * Add new datasets by creating a .ts file and adding metadata to sampleDatasets.
 */

export interface SampleDataset {
  id: string
  name: string
  description: string
  fileName: string
  category: string
  recordCount: number
  recommendedView: 'table' | 'tree' | 'both'
  features: string[]
  icon?: string
  tags?: string[]
}

export interface DatasetCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export const categories: DatasetCategory[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description: 'Artificial intelligence models, capabilities, and benchmarks',
    icon: '🤖',
    color: 'blue'
  },
  {
    id: 'containers',
    name: 'Container Orchestration',
    description: 'Container platforms, orchestration, and management tools',
    icon: '🐳',
    color: 'cyan'
  },
  {
    id: 'devops',
    name: 'Security & DevOps',
    description: 'Security tools and development operations',
    icon: '🔒',
    color: 'purple'
  },
  {
    id: 'cloud',
    name: 'AI & Platform',
    description: 'MCP servers and AI platform integrations',
    icon: '🔌',
    color: 'green'
  }
]

export const sampleDatasets: SampleDataset[] = [
  {
    id: 'ai-models',
    name: 'AI Models Comparison',
    description: 'July 2026 comparison of frontier and mid-tier models (GPT-5.5, Claude Opus 4.8, Microsoft Phi-4 / MAI, DeepSeek V4, Grok 4.3, and others) with pricing, capability tags, benchmarks, and specs.',
    fileName: 'ai-models.ts',
    category: 'ai-ml',
    recordCount: 21,
    recommendedView: 'table',
    features: ['Sorting by cost', 'Filtering by provider', 'Array capabilities', 'Benchmark comparison', 'Pricing analysis'],
    icon: '🤖'
  },
  {
    id: 'container-orchestration',
    name: 'Container Orchestration',
    description: 'Container orchestration platforms including Kubernetes, ECS, GKE, AKS, EKS, OpenShift, and others. Compare deployment models, pricing, and scaling capabilities.',
    fileName: 'container-orchestration.ts',
    category: 'containers',
    recordCount: 11,
    recommendedView: 'table',
    features: ['Deployment models', 'Pricing comparison', 'Scaling capabilities', 'Multi-cloud support'],
    icon: '🐳'
  },
  {
    id: 'security-tools',
    name: 'Security Tools',
    description: 'Security tools and platforms including SAST/DAST, SCA, container scanning, secrets detection, and cloud security. Compare features, pricing, and compliance.',
    fileName: 'security-tools.ts',
    category: 'devops',
    recordCount: 14,
    recommendedView: 'tree',
    features: ['Vulnerability scanning', 'Code analysis', 'Compliance frameworks', 'Integration types'],
    icon: '🔒'
  },
  {
    id: 'mcp-servers',
    name: 'MCP Servers',
    description: 'Model Context Protocol servers including reference tools plus production integrations (GitHub, Stripe, Linear, Sentry, Slack, Notion). Compare capabilities, tools, and resources.',
    fileName: 'mcp-servers.ts',
    category: 'cloud',
    recordCount: 12,
    recommendedView: 'tree',
    features: ['Tools & resources', 'Prompt support', 'Transport types', 'Capability comparison'],
    icon: '🔌'
  }
]

export function getDatasetById(id: string): SampleDataset | undefined {
  return sampleDatasets.find(dataset => dataset.id === id)
}

export function getDatasetsByCategory(categoryId: string): SampleDataset[] {
  return sampleDatasets.filter(dataset => dataset.category === categoryId)
}

export function getAllCategories(): DatasetCategory[] {
  return categories
}

export function getCategoryById(id: string): DatasetCategory | undefined {
  return categories.find(category => category.id === id)
}

export async function loadDatasetData(fileName: string): Promise<any> {
  try {
    const module = await import(`./${fileName}`)
    return module.default || module
  } catch (error) {
    console.error(`Failed to load dataset ${fileName}:`, error)
    throw new Error(`Dataset ${fileName} not found`)
  }
}

export function getDatasetStats() {
  const totalDatasets = sampleDatasets.length
  const totalRecords = sampleDatasets.reduce((sum, dataset) => sum + dataset.recordCount, 0)
  const categoriesCount = categories.length
  
  return {
    totalDatasets,
    totalRecords,
    categoriesCount,
    averageRecordsPerDataset: Math.round(totalRecords / totalDatasets)
  }
}

export function searchDatasets(query: string): SampleDataset[] {
  const lowercaseQuery = query.toLowerCase()
  return sampleDatasets.filter(dataset => 
    dataset.name.toLowerCase().includes(lowercaseQuery) ||
    dataset.description.toLowerCase().includes(lowercaseQuery) ||
    dataset.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function getRecommendedDatasets(useCase: string): SampleDataset[] {
  const recommendations: Record<string, string[]> = {
    'pricing': ['ai-models', 'container-orchestration'],
    'comparison': ['ai-models', 'mcp-servers', 'security-tools'],
    'features': ['mcp-servers', 'container-orchestration', 'security-tools'],
    'technical': ['ai-models', 'container-orchestration', 'mcp-servers'],
    'business': ['ai-models', 'security-tools']
  }
  const recommendedIds = recommendations[useCase.toLowerCase()] || []
  return sampleDatasets.filter(dataset => recommendedIds.includes(dataset.id))
}
