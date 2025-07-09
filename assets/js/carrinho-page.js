// assets/js/carrinho-page.js

document.addEventListener('DOMContentLoaded', () => {
    const carrinhoLista = document.getElementById('carrinho-lista');
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    function renderizarCarrinho() {
        if (carrinho.length === 0) {
            carrinhoLista.innerHTML = '<p class="testocarrinho">Seu carrinho está vazio.</p>';
            document.getElementById('btn-finalizar').disabled = true; // Desabilita o botão
            return;
        }

        document.getElementById('btn-finalizar').disabled = false;

        // Renderiza cada item com imagem, nome, preço, quantidade e botões de ajuste
        carrinhoLista.innerHTML = carrinho.map(p => `
            <div class="carrinho-item" data-id="${p.id}">
                <img src="${p.imagemUrl}" alt="${p.nome}" class="carrinho-img">
                <div class="carrinho-info">
                    <span class="carrinho-nome">${p.nome}</span>
                    <span class="carrinho-preco-unitario">R$ ${p.preco.toFixed(2)}/unidade</span>
                </div>
                <div class="carrinho-quantidade-controle">
                    <button class="btn-quantidade-menos" data-id="${p.id}">-</button>
                    <span class="carrinho-qtd">${p.qtd}</span>
                    <button class="btn-quantidade-mais" data-id="${p.id}">+</button>
                    <button class="btn-remover" data-id="${p.id}">Remover</button>
                </div>
                <span class="carrinho-total-item">R$ ${(p.preco * p.qtd).toFixed(2)}</span>
            </div>
        `).join('');

        // Adiciona event listeners para os botões de quantidade e remover
        document.querySelectorAll('.btn-quantidade-menos').forEach(button => {
            button.addEventListener('click', (e) => ajustarQuantidade(e.target.dataset.id, -1));
        });
        document.querySelectorAll('.btn-quantidade-mais').forEach(button => {
            button.addEventListener('click', (e) => ajustarQuantidade(e.target.dataset.id, 1));
        });
        document.querySelectorAll('.btn-remover').forEach(button => {
            button.addEventListener('click', (e) => removerItem(e.target.dataset.id));
        });

        // Atualiza o total geral do carrinho
        const totalGeral = carrinho.reduce((acc, p) => acc + p.preco * p.qtd, 0);
        const totalDiv = document.createElement('div');
        totalDiv.className = 'carrinho-total-geral';
        totalDiv.innerHTML = `Total do Carrinho: <span>R$ ${totalGeral.toFixed(2)}</span>`;
        carrinhoLista.appendChild(totalDiv);
    }

    function ajustarQuantidade(id, delta) {
        carrinho = carrinho.map(item => {
            if (item.id === id) {
                item.qtd = Math.max(1, item.qtd + delta); // Garante que a quantidade mínima é 1
            }
            return item;
        }).filter(item => item.qtd > 0); // Remove se a quantidade for 0 (caso queira um botão de remover direto)
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        renderizarCarrinho(); // Renderiza novamente
        // Opcional: atualizarBadgeCarrinho(); se essa função estiver em carrinho.js
    }

    function removerItem(id) {
        carrinho = carrinho.filter(item => item.id !== id);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        renderizarCarrinho(); // Renderiza novamente
        // Opcional: atualizarBadgeCarrinho();
    }

    renderizarCarrinho();

     const btnVoltarInicio = document.getElementById('btn-voltar-inicio');

    if (btnVoltarInicio) {
        btnVoltarInicio.addEventListener('click', () => {
            // Redireciona o usuário para a página inicial
            window.location.href = 'index.html'; 
        });
    }

    // Event listener para o botão Finalizar Compra
    const btnFinalizar = document.getElementById('btn-finalizar');
    btnFinalizar.addEventListener('click', () => {
        // Redireciona para a página de checkout
        window.location.href = 'checkout.html';
    });
});