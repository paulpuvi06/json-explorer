/**
 * Internal Developer Portals Dataset
 * 
 * This dataset contains information about Internal Developer Portals (IDPs)
 * including features, pricing, integrations, and capabilities for platform engineering.
 */

export default [
  {
    "platform": "Backstage",
    "provider": "Spotify",
    "founding_year": 2016,
    "open_source": true,
    "pricing_model": "free",
    "deployment_model": "self_hosted",
    "website": "https://backstage.io",
    "managed_options": ["Roadie", "VMware Tanzu"],
    "core_features": ["Service Catalog", "Tech Docs", "Software Templates", "API Documentation"],
    "integrations": {
      "version_control": ["GitHub", "GitLab", "Bitbucket"],
      "ci_cd": ["Jenkins", "GitHub Actions", "GitLab CI"],
      "cloud": ["AWS", "Azure", "GCP"],
      "monitoring": ["Datadog", "New Relic", "Prometheus"]
    },
    "plugin_ecosystem": "extensive",
    "learning_curve": "moderate",
    "community_size": "large",
    "enterprise_features": {
      "authentication": ["RBAC", "SSO", "LDAP"],
      "audit": ["Audit Logs", "Compliance"],
      "customization": ["Custom Plugins", "Themes"]
    },
    "use_cases": ["Service Discovery", "Documentation", "Developer Onboarding", "Platform Engineering"],
    "adoption_level": "high",
    "maturity": "mature"
  },
  {
    "platform": "Port",
    "provider": "Port",
    "founding_year": 2021,
    "open_source": false,
    "pricing_model": "freemium",
    "deployment_model": "saas",
    "website": "https://getport.io",
    "managed_options": ["Port Cloud"],
    "core_features": ["Service Catalog", "Scorecards", "Actions", "Self-Service Actions"],
    "integrations": {
      "version_control": ["GitHub", "GitLab", "Bitbucket"],
      "ci_cd": ["Jenkins", "GitHub Actions", "GitLab CI"],
      "cloud": ["AWS", "Azure", "GCP"],
      "monitoring": ["Datadog", "New Relic", "Prometheus"]
    },
    "plugin_ecosystem": "moderate",
    "learning_curve": "easy",
    "community_size": "medium",
    "enterprise_features": {
      "authentication": ["RBAC", "SSO", "LDAP"],
      "audit": ["Audit Logs", "Compliance"],
      "customization": ["Custom Integrations", "API"]
    },
    "use_cases": ["Service Discovery", "Developer Self-Service", "Platform Engineering", "Compliance"],
    "adoption_level": "growing",
    "maturity": "growing"
  },
  {
    "platform": "OpsLevel",
    "provider": "OpsLevel",
    "founding_year": 2019,
    "open_source": false,
    "pricing_model": "freemium",
    "deployment_model": "saas",
    "website": "https://opslevel.com",
    "managed_options": ["OpsLevel Cloud"],
    "core_features": ["Service Catalog", "Runbooks", "Checks", "Incident Management"],
    "integrations": {
      "version_control": ["GitHub", "GitLab", "Bitbucket"],
      "ci_cd": ["Jenkins", "GitHub Actions", "GitLab CI"],
      "cloud": ["AWS", "Azure", "GCP"],
      "monitoring": ["PagerDuty", "Datadog", "New Relic"]
    },
    "plugin_ecosystem": "moderate",
    "learning_curve": "easy",
    "community_size": "medium",
    "enterprise_features": {
      "authentication": ["RBAC", "SSO", "LDAP"],
      "audit": ["Audit Logs", "Compliance"],
      "customization": ["Custom Checks", "API"]
    },
    "use_cases": ["Service Discovery", "Incident Management", "Runbooks", "Compliance"],
    "adoption_level": "growing",
    "maturity": "growing"
  },
  {
    "platform": "Humanitec",
    "provider": "Humanitec",
    "founding_year": 2018,
    "open_source": false,
    "pricing_model": "freemium",
    "deployment_model": "saas",
    "website": "https://humanitec.com",
    "managed_options": ["Humanitec Cloud"],
    "core_features": ["Platform Orchestration", "Environment Management", "Self-Service", "GitOps"],
    "integrations": {
      "version_control": ["GitHub", "GitLab", "Bitbucket"],
      "ci_cd": ["Jenkins", "GitHub Actions", "GitLab CI"],
      "cloud": ["AWS", "Azure", "GCP"],
      "infrastructure": ["Terraform", "Helm", "Kubernetes"]
    },
    "plugin_ecosystem": "moderate",
    "learning_curve": "moderate",
    "community_size": "small",
    "enterprise_features": {
      "authentication": ["RBAC", "SSO", "LDAP"],
      "audit": ["Audit Logs", "Compliance"],
      "customization": ["Custom Workflows", "API"]
    },
    "use_cases": ["Platform Orchestration", "Environment Management", "Developer Self-Service"],
    "adoption_level": "emerging",
    "maturity": "growing"
  },
  {
    "platform": "Compass",
    "provider": "Atlassian",
    "founding_year": 2022,
    "open_source": false,
    "pricing_model": "freemium",
    "deployment_model": "saas",
    "website": "https://atlassian.com/software/compass",
    "managed_options": ["Atlassian Cloud"],
    "core_features": ["Service Catalog", "Dependencies", "Health Scores", "Team Insights"],
    "integrations": {
      "atlassian": ["Jira", "Confluence", "Bitbucket"],
      "ci_cd": ["Jenkins", "GitHub Actions", "GitLab CI"],
      "cloud": ["AWS", "Azure", "GCP"],
      "monitoring": ["Datadog", "New Relic", "Prometheus"]
    },
    "plugin_ecosystem": "moderate",
    "learning_curve": "easy",
    "community_size": "large",
    "enterprise_features": {
      "authentication": ["RBAC", "SSO", "LDAP"],
      "audit": ["Audit Logs", "Compliance"],
      "customization": ["Custom Fields", "API"]
    },
    "use_cases": ["Service Discovery", "Team Insights", "Dependency Management", "Health Monitoring"],
    "adoption_level": "growing",
    "maturity": "growing"
  },
  {
    "platform": "Pulumi",
    "provider": "Pulumi",
    "founding_year": 2017,
    "open_source": false,
    "pricing_model": "freemium",
    "deployment_model": "saas",
    "website": "https://www.pulumi.com/product/internal-developer-platforms/",
    "managed_options": ["Pulumi Cloud"],
    "core_features": ["Infrastructure as Code", "Golden Paths", "Policy as Code", "Self-Service Infrastructure"],
    "integrations": {
      "version_control": ["GitHub", "GitLab", "Bitbucket"],
      "ci_cd": ["Jenkins", "GitHub Actions", "GitLab CI"],
      "cloud": ["AWS", "Azure", "GCP"],
      "platforms": ["Kubernetes", "Backstage", "REST API"]
    },
    "plugin_ecosystem": "extensive",
    "learning_curve": "moderate",
    "community_size": "large",
    "enterprise_features": {
      "authentication": ["RBAC", "SSO", "SAML"],
      "audit": ["Audit Logs", "Compliance"],
      "customization": ["Custom Components", "Templates", "Policies"]
    },
    "use_cases": ["Infrastructure as Code", "Platform Engineering", "Self-Service Infrastructure", "Policy Enforcement"],
    "adoption_level": "growing",
    "maturity": "mature"
  },
  {
    "platform": "Kratix",
    "provider": "Syntasso",
    "founding_year": 2022,
    "open_source": true,
    "pricing_model": "free",
    "deployment_model": "self_hosted",
    "website": "https://www.kratix.io/",
    "managed_options": ["Syntasso Cloud"],
    "core_features": ["Platform Framework", "Kratix Promises", "Kratix Workflows", "Fleet Management"],
    "integrations": {
      "version_control": ["GitHub", "GitLab", "Bitbucket"],
      "ci_cd": ["Jenkins", "GitHub Actions", "GitLab CI"],
      "cloud": ["AWS", "Azure", "GCP"],
      "infrastructure": ["Terraform", "Helm", "Kubernetes"]
    },
    "plugin_ecosystem": "limited",
    "learning_curve": "hard",
    "community_size": "small",
    "enterprise_features": {
      "authentication": ["RBAC", "SSO"],
      "audit": ["Audit Logs"],
      "customization": ["Custom Promises", "Workflows"]
    },
    "use_cases": ["Platform Framework", "Self-Service Resources", "Business Process Automation", "Fleet Management"],
    "adoption_level": "emerging",
    "maturity": "early"
  }
]