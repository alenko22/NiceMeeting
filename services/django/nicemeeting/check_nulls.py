import os, sys

bad = []
for dirpath, _, files in os.walk('.'):
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(dirpath, f)
            with open(path, 'rb') as file:
                if b'\x00' in file.read():
                    bad.append(path)

if bad:
    print("\nFILES WITH NUL BYTES FOUND:\n")
    print("\n".join(bad))
    sys.exit(1)
else:
    print("No NUL bytes found in .py files.")
