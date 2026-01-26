# Grafana Dashboards

This directory contains pre-built Grafana dashboards for monitoring your MLA application.

## Available Dashboards

### 1. **API Performance Dashboard** (`api-performance.json`)
Monitors API performance metrics across all services:
- Request rate (5-minute average)
- Total requests counter
- Response time percentiles (p95, p99)
- Service health status

**Best for:** Tracking API performance, identifying latency issues

### 2. **System Health Dashboard** (`system-health.json`)
Monitors system-level health metrics:
- CPU usage gauge
- Memory usage gauge
- Service health status
- Memory usage over time
- CPU usage over time

**Best for:** Resource monitoring, capacity planning

### 3. **Auth Service Dashboard** (`auth-service.json`)
Deep dive into Auth Service metrics (Java/Spring Boot):
- Requests per second
- P95 latency
- JVM memory usage
- JVM threads count
- Request rate by endpoint
- Request duration percentiles

**Best for:** Troubleshooting auth service, JVM metrics

## How to Import Dashboards

### Method 1: Manual Import (Recommended)

1. Open Grafana: **http://localhost:3000**
2. Login with `admin` / `admin`
3. Click **Dashboards** (left sidebar)
4. Click **Import**
5. Click **Upload JSON file**
6. Select one of the `.json` files from this directory
7. Select **Prometheus** as data source
8. Click **Import**

### Method 2: Using Grafana API

```bash
# Import API Performance Dashboard
curl -X POST http://localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @api-performance.json \
  -u admin:admin

# Import System Health Dashboard
curl -X POST http://localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @system-health.json \
  -u admin:admin

# Import Auth Service Dashboard
curl -X POST http://localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @auth-service.json \
  -u admin:admin
```

## Dashboard Refresh Rate

All dashboards refresh every **30 seconds** by default. You can change this:
1. Open dashboard
2. Click refresh icon (top-right)
3. Select desired interval

## Customization

Each dashboard can be customized after import:
- Edit panels by clicking on panel title
- Add new panels with **Add Panel** button
- Change time ranges from top-right selector
- Save custom versions

## Metrics Explained

### Common Metrics

| Metric | Purpose |
|--------|---------|
| `http_requests_total` | Total count of HTTP requests |
| `http_request_duration_seconds` | HTTP request duration histogram |
| `process_cpu_usage` | CPU usage percentage |
| `process_resident_memory_bytes` | Process memory usage |
| `up` | Service availability (1=up, 0=down) |

### Auth Service (JVM) Metrics

| Metric | Purpose |
|--------|---------|
| `jvm_memory_used_bytes` | JVM heap memory used |
| `jvm_memory_max_bytes` | JVM heap memory max |
| `jvm_threads_live_threads` | Active JVM threads |

## Troubleshooting

### Dashboard shows "No data"
- Ensure Prometheus is running: **http://localhost:9090**
- Check Prometheus targets are UP
- Wait 30 seconds for metrics to be scraped
- Generate traffic to the services (visit http://localhost:8081)

### Metrics not appearing
- Verify service metrics endpoints:
  - Auth Service: `http://localhost:8080/actuator/prometheus`
  - Activity Tracking: `http://localhost:5300/metrics`
  - Analytics: `http://localhost:5050/metrics`
  - Workout API: `http://localhost:8000/metrics`

### Can't connect to Prometheus
- Check docker: `docker ps | grep prometheus`
- Verify Prometheus is running on port 9090
- Check Grafana data source configuration

## Creating Custom Dashboards

You can create new dashboards:
1. Click **Dashboards** → **New Dashboard**
2. Click **Add Panel**
3. Select Prometheus data source
4. Enter Prometheus queries
5. Save dashboard

## Export Dashboard

To export a dashboard as JSON:
1. Open dashboard
2. Click dashboard settings (gear icon)
3. Click **Save As**
4. Or use API: `GET http://localhost:3000/api/dashboards/uid/{uid}`

## More Information

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/best-practices/)
