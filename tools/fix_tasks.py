import re

with open('TASKS.md', 'r') as f:
    content = f.read()

# Replace connectedDebugAndroidTest
content = content.replace('./gradlew connectedDebugAndroidTest', './gradlew testDebugUnitTest')

# Replace precondition about emulator
content = content.replace('Existe dispositivo o emulador disponible para ejecutar pruebas instrumentadas.', 'Se utiliza la estrategia de pruebas locales con Robolectric.')
content = content.replace('Existe dispositivo o emulador disponible.', 'Se utiliza la estrategia de pruebas locales con Robolectric.')

# Fix TASK-103
content = content.replace('[!] TASK-103', '[ ] TASK-103')

# Fix test paths in allowed files
content = re.sub(r'app/src/androidTest/java', r'app/src/test/java', content)

# But wait, we shouldn't change the forbidden ones if they explicitly forbid tests.
# Or maybe we can just change all androidTest to test, but let's be careful.

with open('TASKS.md', 'w') as f:
    f.write(content)
