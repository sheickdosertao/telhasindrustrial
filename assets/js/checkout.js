// assets/js/checkout.js

console.log('--- Início do checkout.js ---');
document.addEventListener('DOMContentLoaded', async () => {

    console.log('DOMContentLoaded disparado em checkout.js.');

    const cart = JSON.parse(localStorage.getItem('carrinho')) || [];

    console.log('Carrinho obtido:', cart);

    if (cart.length === 0) {
         console.log('Carrinho vazio. Exibindo mensagem e retornando.');
        document.getElementById('checkout').innerHTML = 'Seu carrinho está vazio. Por favor, adicione itens para finalizar a compra.';
        document.getElementById('mercadopago-btn').innerHTML = ''; // Garante que o container do MP esteja vazio
        return;
    }

    // Exibe resumo com as informações corretas (imagem, nome, qtd, preço total do item)
    document.getElementById('checkout').innerHTML = cart.map(p => `
        <div class="checkout-item-resumo">
            <img src="${p.imagemUrl}" alt="${p.nome}" class="checkout-img-resumo">
            <div class="checkout-info-resumo">
                <span>${p.nome}</span>
                <span>R$ ${p.preco.toFixed(2)} x ${p.qtd}</span>
            </div>
            <span class="checkout-total-item-resumo">R$ ${(p.preco * p.qtd).toFixed(2)}</span>
        </div>
    `).join('') + `
    <div class="checkout-total-geral-resumo">
        Total: R$ ${cart.reduce((acc, p) => acc + p.preco * p.qtd, 0).toFixed(2)}
    </div>`;

    // ou obter esses dados de outra forma (ex: de um usuário logado)
    const payerEmailInput = document.getElementById('payer-email');
    const payerNameInput = document.getElementById('payer-name');
    const payerSurnameInput = document.getElementById('payer-surname');

    console.log('Inputs do pagador referenciados.');

       const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');

    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener('click', async () => { // Torna a função assíncrona
            console.log('Botão "Finalizar Compra" clicado.');

            // Agora, sim, verifica os campos de pagador
            if (!payerEmailInput.value || !payerNameInput.value || !payerSurnameInput.value) {
                document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Por favor, preencha todos os dados do pagador para continuar.</p>`;
                console.log('Dados do pagador incompletos após clique. Não prosseguindo.');
                return;
            }
    

    const payerEmail = payerEmailInput.value;
    const payerName = payerNameInput.value;
    const payerSurname = payerSurnameInput.value;

    console.log('Dados do pagador preenchidos e válidos após clique:', payerEmail, payerName, payerSurname);
    
     btnFinalizarCompra.disabled = true;
     document.getElementById('mercadopago-btn').innerHTML = `<p>Processando pagamento...</p>`;

    // Chama backend para criar preferência Mercado Pago
    try {
                console.log('Iniciando requisição fetch para o backend.');
                const response = await fetch('https://beckendindustrialtelhas.onrender.com/api/mercadopago-preferencia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        payerEmail: payerEmail,
                        payerName: payerName,
                        payerSurname: payerSurname,
                    })
                });
                console.log('Requisição fetch enviada.');

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Erro ao criar preferência:', errorData);
                    document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Erro ao carregar pagamento: ${errorData.error || 'Verifique o console.'}</p>`;
                    btnFinalizarCompra.disabled = false; // Reabilita o botão em caso de erro
                    return;
                }

                const { id, init_point } = await response.json();
                console.log('Preferência criada com ID:', id);

                if (id) {
                    // Limpa o conteúdo anterior do container do Brick
                    document.getElementById('mercadopago-btn').innerHTML = ''; 
                    const mp = new MercadoPago('APP_USR-e0b13799-5c13-413a-a2f2-195c732a147f', {
                        locale: 'pt-BR'
                    });

                    mp.bricks().create("wallet", "mercadopago-btn", {
                        initialization: {
                            preferenceId: id,
                        },
                        customization: {
                            texts: { valueProp: 'smart_option' },
                            visual: {
                                buttonBackground: 'black',
                                borderRadius: '6px',
                                horizontalPadding: '16px',
                                verticalPadding: '14px',
                            }
                        },
                        callbacks: {
                            onReady: () => {
                                console.log('Mercado Pago Wallet Brick pronto para uso.');
                                btnFinalizarCompra.style.display = 'none'; // Esconde o botão após o Brick carregar
                            },
                            onError: (error) => {
                                console.error('Erro ao carregar o Mercado Pago Wallet Brick:', error);
                                document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Não foi possível carregar os métodos de pagamento. Erro: ${error.message || 'Desconhecido'}</p>`;
                                btnFinalizarCompra.disabled = false; // Reabilita o botão em caso de erro do Brick
                            },
                        },
                    });
                } else {
                    console.error('ID da preferência não recebido do backend.');
                    document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Falha ao inicializar o pagamento: ID da preferência ausente.</p>`;
                    btnFinalizarCompra.disabled = false; // Reabilita o botão
                }

            } catch (error) {
                console.error('Erro na requisição ao backend para criar preferência:', error);
                document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Erro de conexão com o servidor de pagamento. Por favor, tente novamente.</p>`;
                btnFinalizarCompra.disabled = false; // Reabilita o botão
            }
        });
    } else {
        console.error('Botão "Finalizar Compra" (#btn-finalizar-compra) não encontrado!');
    }
});