#!/usr/bin/env bash

set -euo pipefail

CONTAINER_NAME="${1:-shop404-sql}"
DB_NAME="${2:-Shop404UmbracoDev}"
SQL_USER="${3:-sa}"
SQL_PASSWORD="${MSSQL_SA_PASSWORD:-}"

if [[ -z "${SQL_PASSWORD}" ]]; then
  echo "MSSQL_SA_PASSWORD is required (export it before running this script)."
  echo "Example: MSSQL_SA_PASSWORD='Your_strong_password123!' scripts/create-umbraco-db.sh"
  exit 1
fi

SQLCMD_PATH=""
if docker exec "${CONTAINER_NAME}" test -x /opt/mssql-tools18/bin/sqlcmd; then
  SQLCMD_PATH="/opt/mssql-tools18/bin/sqlcmd"
elif docker exec "${CONTAINER_NAME}" test -x /opt/mssql-tools/bin/sqlcmd; then
  SQLCMD_PATH="/opt/mssql-tools/bin/sqlcmd"
else
  echo "Could not find sqlcmd in container '${CONTAINER_NAME}'."
  exit 1
fi

docker exec -i "${CONTAINER_NAME}" "${SQLCMD_PATH}" \
  -S localhost \
  -U "${SQL_USER}" \
  -P "${SQL_PASSWORD}" \
  -C \
  -Q "IF DB_ID(N'${DB_NAME}') IS NULL CREATE DATABASE [${DB_NAME}];"

echo "Database '${DB_NAME}' is ready in container '${CONTAINER_NAME}'."
