import os
import sys

print(sys.argv[1])
print(f"Directory?: {os.path.isdir(sys.argv[1])}")