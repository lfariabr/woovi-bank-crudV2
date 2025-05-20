# Terminal command
redis-cli ping  

# Check redis process
ps aux | grep redis

# Check the process:
lsof -i :6381

# Run redis-server in background mode:
redis-server --port 6381 &