/**
 * Sample Dataset Metadata and Types
 * 
 * This file defines the structure and metadata for all sample datasets
 * used in the JSON Explorer application.
 * 
 * HOW TO ADD A NEW SAMPLE DATASET:
 * 
 * 1. Create a new TypeScript file in this directory (e.g., "my-dataset.ts")
 *    - Use realistic, current data (2024-2025)
 *    - Keep records between 10-25 for optimal demo experience
 *    - Include diverse data types (strings, numbers, booleans, arrays, objects)
 *    - Export as: export default [array of objects]
 *    - Add a header comment explaining the data source and purpose
 * 
 * 2. Add metadata to the sampleDatasets array below:
 *    - id: unique identifier (kebab-case)
 *    - name: display name
 *    - description: brief description of what the dataset demonstrates
 *    - fileName: name of the TypeScript file (with .ts extension)
 *    - category: one of the existing category IDs
 *    - recordCount: number of records in the dataset
 *    - recommendedView: 'table', 'tree', or 'both'
 *    - features: array of key features this dataset demonstrates
 *    - icon: emoji or icon representation
 *    - tags: optional array of searchable tags
 * 
 * 3. The dataset will automatically appear in the sample selector modal
 *    and be available for dynamic loading.
 * 
 * EXAMPLE:
 * {
 *   id: 'my-new-dataset',
 *   name: 'My New Dataset',
 *   description: 'Demonstrates advanced filtering and sorting capabilities',
 *   fileName: 'my-dataset.ts',
 *   category: 'databases',
 *   recordCount: 15,
 *   recommendedView: 'table',
 *   features: ['Advanced filtering', 'Custom sorting', 'Data validation'],
 *   icon: '📊',
 *   tags: ['analytics', 'filtering', 'sorting']
 * }
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
    name: 'Platform Engineering',
    description: 'Internal developer portals and platform tools',
    icon: '🏗️',
    color: 'green'
  }
]

export const sampleDatasets: SampleDataset[] = [
  {
    id: 'ai-models',
    name: 'AI Models Comparison',
    description: 'Comprehensive comparison of AI models including GPT-4o, Claude 3.5, Gemini 2.0, and more. Features pricing, capabilities, benchmarks, and technical specifications.',
    fileName: 'ai-models.ts',
    category: 'ai-ml',
    recordCount: 20,
    recommendedView: 'table',
    features: ['Sorting by cost', 'Filtering by provider', 'Array capabilities', 'Benchmark comparison', 'Pricing analysis'],
    icon: '🤖'
  },
  {
    id: 'container-orchestration',
    name: 'Container Orchestration',
    description: 'Container orchestration platforms including Kubernetes, Docker Swarm, ECS, AKS, and others. Compare deployment models, pricing, and scaling capabilities.',
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
    description: 'Security tools and platforms including vulnerability scanners, SAST/DAST tools, and security monitoring. Compare features, pricing, and compliance.',
    fileName: 'security-tools.ts',
    category: 'devops',
    recordCount: 12,
    recommendedView: 'tree',
    features: ['Vulnerability scanning', 'Code analysis', 'Compliance frameworks', 'Integration types'],
    icon: '🔒'
  },
  {
    id: 'internal-developer-portals',
    name: 'Internal Developer Portals',
    description: 'Platform engineering tools including Backstage, Port, OpsLevel, and others. Compare features, pricing, and integrations for developer experience.',
    fileName: 'internal-developer-portals.ts',
    category: 'cloud',
    recordCount: 8,
    recommendedView: 'tree',
    features: ['Service catalog', 'Platform engineering', 'Developer experience', 'Integration analysis'],
    icon: '🏗️'
  }
]

/**
 * Get dataset by ID
 */
export function getDatasetById(id: string): SampleDataset | undefined {
  return sampleDatasets.find(dataset => dataset.id === id)
}

/**
 * Get datasets by category
 */
export function getDatasetsByCategory(categoryId: string): SampleDataset[] {
  return sampleDatasets.filter(dataset => dataset.category === categoryId)
}

/**
 * Get all dataset categories
 */
export function getAllCategories(): DatasetCategory[] {
  return categories
}

/**
 * Get category by ID
 */
export function getCategoryById(id: string): DatasetCategory | undefined {
  return categories.find(category => category.id === id)
}

/**
 * Load dataset data dynamically
 * This function will be used to import the actual JSON data
 */
export async function loadDatasetData(fileName: string): Promise<any> {
  try {
    const module = await import(`./${fileName}`)
    return module.default || module
  } catch (error) {
    console.error(`Failed to load dataset ${fileName}:`, error)
    throw new Error(`Dataset ${fileName} not found`)
  }
}

/**
 * Get dataset statistics
 */
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

/**
 * Search datasets by name or description
 */
export function searchDatasets(query: string): SampleDataset[] {
  const lowercaseQuery = query.toLowerCase()
  return sampleDatasets.filter(dataset => 
    dataset.name.toLowerCase().includes(lowercaseQuery) ||
    dataset.description.toLowerCase().includes(lowercaseQuery) ||
    dataset.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

/**
 * Get recommended datasets for a specific use case
 */
export function getRecommendedDatasets(useCase: string): SampleDataset[] {
  const recommendations: Record<string, string[]> = {
    'pricing': ['ai-models', 'cloud-providers', 'cicd-platforms', 'monitoring-observability'],
    'comparison': ['ai-models', 'cloud-providers', 'database-systems', 'monitoring-observability'],
    'features': ['cicd-platforms', 'container-orchestration', 'database-systems'],
    'technical': ['ai-models', 'database-systems', 'container-orchestration'],
    'business': ['cloud-providers', 'cicd-platforms', 'monitoring-observability']
  }
  
  const recommendedIds = recommendations[useCase.toLowerCase()] || []
  return sampleDatasets.filter(dataset => recommendedIds.includes(dataset.id))
}
