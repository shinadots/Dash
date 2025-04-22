import streamlit as st
import pandas as pd
import datetime

# ====== SIDEBAR - FILTROS ======
st.sidebar.title("Filtros")

# Exemplo de dados de clientes, campanhas, etc. (serão dinâmicos depois)
clientes = ["Cliente A", "Cliente B"]
campanhas = ["Campanha 1", "Campanha 2"]
conjuntos = ["Conjunto 1", "Conjunto 2"]
anuncios = ["Anuncio 1", "Anuncio 2"]

cliente = st.sidebar.selectbox("Cliente", clientes)
campanha = st.sidebar.selectbox("Campanha", campanhas)
conjunto = st.sidebar.selectbox("Conjunto de Anúncio", conjuntos)
anuncio = st.sidebar.selectbox("Anúncio", anuncios)
data_inicio = st.sidebar.date_input("Data início", datetime.date.today() - datetime.timedelta(days=7))
data_fim = st.sidebar.date_input("Data fim", datetime.date.today())

# ====== HEADER PRINCIPAL ======
st.title("📊 Dashboard de Tráfego Pago")
st.markdown(f"Visualização de dados para **{cliente}**, entre {data_inicio} e {data_fim}.")

# ====== PÁGINAS ======
pagina = st.sidebar.radio("Página", ["Visão Geral", "Criativos Ativos", "Dias e Horários"])

# ====== PÁGINA: VISÃO GERAL ======
if pagina == "Visão Geral":
    st.header("📈 Visão Geral")
    st.write("Métricas principais aqui, como CPA, investimento, cliques, leads...")
    
    # Exemplo de visualização de métricas fictícias
    col1, col2, col3 = st.columns(3)
    col1.metric("Investimento", "R$ 1.200,00")
    col2.metric("Leads", "47")
    col3.metric("CPA", "R$ 25,53")

# ====== PÁGINA: CRIATIVOS ATIVOS ======
elif pagina == "Criativos Ativos":
    st.header("🎨 Criativos Ativos")
    st.write("Lista de criativos com imagens, textos e desempenho.")

# ====== PÁGINA: DIAS E HORÁRIOS ======
elif pagina == "Dias e Horários":
    st.header("🕒 Dias e Horários com Melhor Desempenho")
    st.write("Visualização de desempenho por dia da semana e horário.")
