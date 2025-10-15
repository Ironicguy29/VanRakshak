# Quick script to remove Documentation section
with open('menu.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove lines 167-172 (Documentation section)
new_lines = []
skip_next = 0
for i, line in enumerate(lines):
    if 'DOCUMENTATION' in line and 'BG_BLUE' in line:
        skip_next = 6  # Skip this line and next 5 lines
        continue
    if skip_next > 0:
        skip_next -= 1
        continue
    new_lines.append(line)

# Write to file
with open('menu.py', 'w', encoding='utf-8', newline='') as f:
    f.writelines(new_lines)

print("✓ Documentation section removed!")
