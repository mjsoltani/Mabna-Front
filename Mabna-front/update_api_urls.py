#!/usr/bin/env python3
import os
import re

# List of JSX files to update
jsx_files = [
    'frontend/src/components/DashboardStats.jsx',
    'frontend/src/components/Invitations.jsx',
    'frontend/src/components/Notifications.jsx',
    'frontend/src/components/Objectives.jsx',
    'frontend/src/components/Tasks.jsx',
    'frontend/src/components/TasksV2.jsx',
    'frontend/src/components/Teams.jsx',
]

for file_path in jsx_files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has import
    if "import API_BASE_URL from '../config'" not in content:
        # Add import after other imports
        import_pattern = r"(import\s+{[^}]+}\s+from\s+['\"]react['\"];)"
        if re.search(import_pattern, content):
            content = re.sub(
                import_pattern,
                r"\1\nimport API_BASE_URL from '../config';",
                content
            )
        else:
            # If no react import, add at the beginning
            first_import = re.search(r"^import", content, re.MULTILINE)
            if first_import:
                content = content[:first_import.start()] + "import API_BASE_URL from '../config';\n" + content[first_import.start():]
    
    # Replace all localhost:3000 URLs
    content = re.sub(
        r"'http://localhost:3000",
        r"'${API_BASE_URL}",
        content
    )
    content = re.sub(
        r"`http://localhost:3000",
        r"`${API_BASE_URL}",
        content
    )
    
    # Fix the template literals
    content = re.sub(
        r"\$\{API_BASE_URL\}",
        r"${API_BASE_URL}",
        content
    )
    
    # Replace in template strings properly
    content = re.sub(
        r"fetch\('(\$\{API_BASE_URL\}[^']*)'",
        r"fetch(`\1`",
        content
    )
    content = re.sub(
        r'fetch\("(\$\{API_BASE_URL\}[^"]*)"\)',
        r'fetch(`\1`)',
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated: {file_path}")

print("Done!")
