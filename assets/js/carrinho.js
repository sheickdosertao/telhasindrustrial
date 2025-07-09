const carrinhoGlobal = { // Renomeado para evitar conflito com a variável interna da função
    get() {
        return JSON.parse(localStorage.getItem('carrinho')) || [];
    },
    // Removi o método 'add' daqui, pois a função 'adicionarAoCarrinho' abaixo é mais completa.
    // Você pode integrar as duas se desejar uma estrutura mais orientada a objetos.
    clear() {
        localStorage.removeItem('carrinho');
        atualizarBadgeCarrinho();
    }
};



// Função para adicionar/atualizar produto no carrinho
function adicionarAoCarrinho(produtoId, nome, preco, imagemUrl) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const produtoExistente = carrinho.find(p => p.id === produtoId);

    if (produtoExistente) {
        produtoExistente.qtd += 1; // Incrementa a quantidade se já existe
    } else {
        // Se o produto não existe, adiciona com quantidade 1
        carrinho.push({ id: produtoId, nome, preco, imagemUrl, qtd: 1 });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarBadgeCarrinho(); // Atualiza o badge após a adição
    console.log('Carrinho atualizado:', carrinho); // Para depuração
    alert(`${nome} adicionado ao carrinho!`); // Feedback para o usuário
}

// Função para atualizar o número de itens no badge do carrinho
function atualizarBadgeCarrinho() {
    const carrinhoConteudo = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinhoConteudo.reduce((acc, item) => acc + item.qtd, 0);
    const badge = document.querySelector('.carrinho-badge'); // Seleciona o primeiro badge encontrado

    if (badge) {
        badge.textContent = totalItens;
        badge.style.display = totalItens > 0 ? 'inline-block' : 'none';
    }
}
// Quando o DOM estiver completamente carregado (importante para encontrar os botões)
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o badge ao carregar a página
    atualizarBadgeCarrinho();

    // Seleciona TODOS os botões de comprar
    const botoesComprar = document.querySelectorAll('.btn-comprar');

    // Adiciona um event listener para cada botão 'Comprar'
    botoesComprar.forEach(botao => {
        botao.addEventListener('click', (event) => {
            // Previne o comportamento padrão (ex: se o botão estiver dentro de um formulário)
            event.preventDefault();

            // Encontra o elemento pai '.produto' para obter os dados
            const produtoDiv = event.target.closest('.produto');

            if (produtoDiv) {
                // Obtém os dados dos atributos data-* (ID, nome, preço e IMAGEM)
                const id = produtoDiv.dataset.id;
                const nome = produtoDiv.dataset.nome;
                const preco = parseFloat(produtoDiv.dataset.preco);
                const imagemUrl = produtoDiv.dataset.imagem; // <-- ESSENCIAL!

                // Chama a função para adicionar ao carrinho
                adicionarAoCarrinho(id, nome, preco, imagemUrl);

                // IMPORTANTE: Remova o redirecionamento imediato para o carrinho.html daqui.
                // O usuário deve ser redirecionado APENAS quando clicar no botão "Finalizar Compra" na página do carrinho.
                // window.location.href = '/carrinho.html'; // Remova ou comente esta linha!
            } else {
                console.error('Erro: Não foi possível encontrar o elemento .produto pai para obter os dados do produto.');
            }
        });
    });

 // Se você tiver um botão "Limpar Carrinho" em algum lugar, pode usar:
     const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
         if (btnLimparCarrinho) {
             btnLimparCarrinho.addEventListener('click', () => {
             carrinhoGlobal.clear();
          alert('Carrinho limpo!');
         });
     }

});
