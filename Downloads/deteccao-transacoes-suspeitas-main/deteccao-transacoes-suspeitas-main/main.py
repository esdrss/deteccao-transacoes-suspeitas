import pandas as pd
import statistics

df = pd.read_excel(r"C:\Users\debor\Downloads\deteccao-transacoes-suspeitas-main\deteccao-transacoes-suspeitas-main\transacoes_prontas.xlsx")
valores = df["valor"]
media = statistics.mean(valores)
desvio = statistics.stdev(valores)

limite = media + 3 * desvio
suspeitas = df[df["valor"] > limite]

print(f"Média: {media:.2f}")
print(f"Desvio padrão: {desvio:.2f}")
print(f"Limite: {limite:.2f}")
print(f"Quantidade de suspeitas: {len(suspeitas)}")
print(suspeitas)
