# Vault Configuration File
# Documentation: https://www.vaultproject.io/docs/configuration

ui = true

# Listener for API and UI
listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_disable   = 1  # Set to 0 in production with proper certificates
  # tls_cert_file = "/vault/tls/tls.crt"
  # tls_key_file  = "/vault/tls/tls.key"
}

# Storage backend
storage "file" {
  path = "/vault/data"
}

# API address
api_addr = "http://0.0.0.0:8200"

# Cluster address (for HA setup)
# cluster_addr = "https://127.0.0.1:8201"

# Disable mlock (required for Docker without IPC_LOCK capability)
disable_mlock = false

# Default lease duration
default_lease_ttl = "168h"  # 7 days
max_lease_ttl     = "720h"  # 30 days

# Log level
log_level = "Info"

# Telemetry
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname          = false
}
