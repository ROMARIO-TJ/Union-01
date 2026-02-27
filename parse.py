import re

with open('raw_calendar.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# remove paging
text = re.sub(r'COMET - Federación Colombiana de Fútbol - Horario de competiciones Página: \d+ /\d+\n', '', text)
text = text.replace('NÚMERO TOTAL DE RESULTADOS: 132', '')

# replace multi-line team names to avoid parsing issues
reps = {
    'ALIANZA FC "B" (DIVISIONES MENORES)': 'ALIANZA FC "B"',
    'ALIANZA FC "B" (DIVISIONES\nMENORES)': 'ALIANZA FC "B"',
    'ALIANZA FC "B"\n(DIVISIONES MENORES)': 'ALIANZA FC "B"',
    '"B"ACAD\nVALLEDUPAR FC': '"B"ACAD VALLEDUPAR FC',
    'LOS EMBAJADORES DE EL\nBANCO': 'LOS EMBAJADORES DE EL BANCO',
    'LOS EMBAJADORES DE EL BANCO': 'LOS EMBAJADORES DE EL BANCO',
    'ATLETAS DEL\nMAÑANA': 'ATLETAS DEL MAÑANA',
    'FUTURAS\nESTRELLAS': 'FUTURAS ESTRELLAS',
    'MANCHESTER\nVALLEDUPAR': 'MANCHESTER VALLEDUPAR'
}

for k, v in reps.items():
    text = text.replace(k, v)

# find all fechas
blocks = re.split(r'Fecha (\d+)\n', text)

matches = []

months = {'01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun','07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic'}

current_fecha = 0
for i in range(1, len(blocks), 2):
    fecha_num = int(blocks[i])
    if fecha_num < 3:
        continue # skip first 2
    content = blocks[i+1].strip()
    
    # regex to match team A - Team B Date Time ENTRADO Stadium
    # Since stadiums can have newlines, let's split by date pattern
    parts = re.split(r'(\d{2}\.\d{2}\.2026 \d{2}:\d{2} ENTRADO)', content)
    
    last_idx = len(parts) - 1
    # parts: 0: teams, 1: datetime, 2: stadium + teams, 3: datetime ...
    for j in range(1, len(parts), 2):
        if j == 1:
            teams_part = parts[0]
        else:
            # previous part[2] had stadium + current teams. 
            # How to split stadium from teams?
            # Teams always have a "-" in between and are at the end of the string.
            # Stadium is usually all caps or names.
            # Let's look for the last newline before the hyphen? Not necessarily, sometimes team name is on the same line as stadium.
            # Actually, team names are well known. Let's find known team names.
            pass
