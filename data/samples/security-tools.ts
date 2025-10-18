/**
 * Security Tools Dataset
 * 
 * This dataset contains information about security tools and platforms
 * including vulnerability scanners, SAST/DAST tools, and security monitoring.
 */

export default [
  {
    "tool": "Snyk",
    "category": "Vulnerability Management",
    "founding_year": 2015,
    "pricing_model": "freemium",
    "free_tier": "200 tests/month",
    "paid_tiers": {
      "team": "$25/developer/month",
      "enterprise": "Custom pricing"
    },
    "supported_languages": ["JavaScript", "Python", "Java", "C#", "Go", "PHP", "Ruby", "Swift"],
    "integration_types": ["CI/CD", "IDE", "SCM", "Container Registry"],
    "scanning_types": ["SAST", "SCA", "Container", "Infrastructure"],
    "compliance_frameworks": ["SOC2", "ISO27001", "PCI DSS", "HIPAA"],
    "api_available": true,
    "learning_curve": "easy",
    "community_size": "large",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Policies"]
  },
  {
    "tool": "SonarQube",
    "category": "Code Quality & Security",
    "founding_year": 2008,
    "pricing_model": "freemium",
    "free_tier": "Community Edition",
    "paid_tiers": {
      "developer": "$150/developer/year",
      "enterprise": "$20,000/year"
    },
    "supported_languages": ["Java", "C#", "JavaScript", "Python", "PHP", "C++", "Go", "Swift"],
    "integration_types": ["CI/CD", "IDE", "SCM", "ALM"],
    "scanning_types": ["SAST", "Code Quality", "Security Hotspots"],
    "compliance_frameworks": ["OWASP", "CWE", "SANS Top 25"],
    "api_available": true,
    "learning_curve": "moderate",
    "community_size": "very_large",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Rules"]
  },
  {
    "tool": "Veracode",
    "category": "Application Security",
    "founding_year": 2006,
    "pricing_model": "enterprise",
    "free_tier": "No free tier",
    "paid_tiers": {
      "static": "Custom pricing",
      "dynamic": "Custom pricing",
      "software_composition": "Custom pricing"
    },
    "supported_languages": ["Java", "C#", "JavaScript", "Python", "PHP", "C++", "Go", "Swift"],
    "integration_types": ["CI/CD", "IDE", "SCM", "ALM"],
    "scanning_types": ["SAST", "DAST", "SCA", "Manual Testing"],
    "compliance_frameworks": ["OWASP", "PCI DSS", "HIPAA", "SOC2"],
    "api_available": true,
    "learning_curve": "moderate",
    "community_size": "medium",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Policies"]
  },
  {
    "tool": "Checkmarx",
    "category": "Application Security",
    "founding_year": 2006,
    "pricing_model": "enterprise",
    "free_tier": "No free tier",
    "paid_tiers": {
      "static": "Custom pricing",
      "dynamic": "Custom pricing",
      "sca": "Custom pricing"
    },
    "supported_languages": ["Java", "C#", "JavaScript", "Python", "PHP", "C++", "Go", "Swift"],
    "integration_types": ["CI/CD", "IDE", "SCM", "ALM"],
    "scanning_types": ["SAST", "DAST", "SCA", "Infrastructure"],
    "compliance_frameworks": ["OWASP", "PCI DSS", "HIPAA", "SOC2"],
    "api_available": true,
    "learning_curve": "moderate",
    "community_size": "medium",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Rules"]
  },
  {
    "tool": "OWASP ZAP",
    "category": "Dynamic Application Security Testing",
    "founding_year": 2010,
    "pricing_model": "free",
    "free_tier": "Open source",
    "paid_tiers": {
      "commercial_support": "Custom pricing"
    },
    "supported_languages": ["Web Applications", "APIs", "SPA"],
    "integration_types": ["CI/CD", "IDE", "SCM", "API Testing"],
    "scanning_types": ["DAST", "API Security", "Authentication Testing"],
    "compliance_frameworks": ["OWASP Top 10", "CWE", "SANS Top 25"],
    "api_available": true,
    "learning_curve": "moderate",
    "community_size": "large",
    "enterprise_features": ["RBAC", "Audit Logs", "Custom Scripts"]
  },
  {
    "tool": "Burp Suite",
    "category": "Web Application Security",
    "founding_year": 2001,
    "pricing_model": "freemium",
    "free_tier": "Community Edition",
    "paid_tiers": {
      "professional": "$399/year",
      "enterprise": "$3,995/year"
    },
    "supported_languages": ["Web Applications", "APIs", "Mobile Apps"],
    "integration_types": ["CI/CD", "IDE", "SCM", "API Testing"],
    "scanning_types": ["DAST", "API Security", "Authentication Testing"],
    "compliance_frameworks": ["OWASP Top 10", "PCI DSS", "HIPAA"],
    "api_available": true,
    "learning_curve": "moderate",
    "community_size": "very_large",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Extensions"]
  },
  {
    "tool": "Nessus",
    "category": "Vulnerability Assessment",
    "founding_year": 1998,
    "pricing_model": "freemium",
    "free_tier": "Home (16 IPs)",
    "paid_tiers": {
      "professional": "$3,990/year",
      "enterprise": "Custom pricing"
    },
    "supported_languages": ["Network Infrastructure", "Web Applications", "Databases"],
    "integration_types": ["SIEM", "Ticketing", "Patch Management"],
    "scanning_types": ["Network", "Web", "Database", "Compliance"],
    "compliance_frameworks": ["PCI DSS", "HIPAA", "SOX", "NIST"],
    "api_available": true,
    "learning_curve": "moderate",
    "community_size": "large",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Policies"]
  },
  {
    "tool": "Qualys",
    "category": "Cloud Security",
    "founding_year": 1999,
    "pricing_model": "freemium",
    "free_tier": "Limited scans",
    "paid_tiers": {
      "vmdr": "Custom pricing",
      "cs": "Custom pricing",
      "was": "Custom pricing"
    },
    "supported_languages": ["Web Applications", "Infrastructure", "Cloud Resources"],
    "integration_types": ["SIEM", "Ticketing", "Patch Management", "Cloud"],
    "scanning_types": ["Vulnerability", "Web App", "Cloud Security", "Compliance"],
    "compliance_frameworks": ["PCI DSS", "HIPAA", "SOX", "NIST", "CIS"],
    "api_available": true,
    "learning_curve": "moderate",
    "community_size": "large",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Dashboards"]
  },
  {
    "tool": "Rapid7",
    "category": "Security Operations",
    "founding_year": 2000,
    "pricing_model": "freemium",
    "free_tier": "Limited scans",
    "paid_tiers": {
      "insightvm": "Custom pricing",
      "insightidr": "Custom pricing",
      "metasploit": "Custom pricing"
    },
    "supported_languages": ["Web Applications", "Infrastructure", "Cloud Resources"],
    "integration_types": ["SIEM", "Ticketing", "Patch Management", "Cloud"],
    "scanning_types": ["Vulnerability", "Web App", "Cloud Security", "Threat Detection"],
    "compliance_frameworks": ["PCI DSS", "HIPAA", "SOX", "NIST", "CIS"],
    "api_available": true,
    "learning_curve": "moderate",
    "community_size": "large",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Dashboards"]
  },
  {
    "tool": "GitGuardian",
    "category": "Secrets Management",
    "founding_year": 2017,
    "pricing_model": "freemium",
    "free_tier": "Public repos only",
    "paid_tiers": {
      "team": "$15/developer/month",
      "enterprise": "Custom pricing"
    },
    "supported_languages": ["All languages", "Configuration files", "Infrastructure"],
    "integration_types": ["CI/CD", "IDE", "SCM", "SIEM"],
    "scanning_types": ["Secrets Detection", "Infrastructure", "Compliance"],
    "compliance_frameworks": ["SOC2", "ISO27001", "PCI DSS", "HIPAA"],
    "api_available": true,
    "learning_curve": "easy",
    "community_size": "medium",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Policies"]
  },
  {
    "tool": "Semgrep",
    "category": "Static Analysis",
    "founding_year": 2019,
    "pricing_model": "freemium",
    "free_tier": "Open source",
    "paid_tiers": {
      "team": "$25/developer/month",
      "enterprise": "Custom pricing"
    },
    "supported_languages": ["JavaScript", "Python", "Java", "C#", "Go", "PHP", "Ruby", "Swift"],
    "integration_types": ["CI/CD", "IDE", "SCM", "API"],
    "scanning_types": ["SAST", "Security", "Code Quality"],
    "compliance_frameworks": ["OWASP", "CWE", "SANS Top 25"],
    "api_available": true,
    "learning_curve": "easy",
    "community_size": "growing",
    "enterprise_features": ["RBAC", "SSO", "Audit Logs", "Custom Rules"]
  },
  {
    "tool": "Trivy",
    "category": "Container Security",
    "founding_year": 2019,
    "pricing_model": "free",
    "free_tier": "Open source",
    "paid_tiers": {
      "commercial_support": "Custom pricing"
    },
    "supported_languages": ["Container Images", "Kubernetes", "Infrastructure"],
    "integration_types": ["CI/CD", "Container Registry", "Kubernetes", "SCM"],
    "scanning_types": ["Container", "Vulnerability", "Secrets", "Infrastructure"],
    "compliance_frameworks": ["CIS", "NIST", "PCI DSS"],
    "api_available": true,
    "learning_curve": "easy",
    "community_size": "large",
    "enterprise_features": ["RBAC", "Audit Logs", "Custom Policies"]
  }
]
