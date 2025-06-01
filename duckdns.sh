#!/bin/bash
LOGFILE="/Users/user/duckdns/duck.log"
echo url="https://www.duckdns.org/update?domains=your-subdomain&token=5c994dad-773f-4c7f-a664-ec180d158c87&ip=" | curl -k -o ~/duckdns/duck.log -K -