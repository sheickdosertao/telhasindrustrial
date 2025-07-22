// assets/js/checkout.js

console.log('--- Início do checkout.js ---');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded disparado em checkout.js.');

    // --- 1. Referências aos elementos do DOM (APENAS os elementos, NÃO seus valores ainda) ---
    // Estas referências devem ser obtidas uma vez que o DOM esteja carregado
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');
    const payerEmailInput = document.getElementById('payer-email');
    const payerNameInput = document.getElementById('payer-name');
    const payerSurnameInput = document.getElementById('payer-surname');
    const payerCpfInput = document.getElementById('payer-cpf');
    
    // Referências aos novos campos de endereço
    const addressCepInput = document.getElementById('address-cep');
    const addressStreetInput = document.getElementById('address-street');
    const addressNumberInput = document.getElementById('address-number');
    const addressComplementInput = document.getElementById('address-complement');
    const addressNeighborhoodInput = document.getElementById('address-neighborhood');
    const addressCityInput = document.getElementById('address-city');
    const addressStateInput = document.getElementById('address-state');

    console.log('Inputs do pagador e endereço referenciados.');

    const cart = JSON.parse(localStorage.getItem('carrinho')) || [];
    console.log('Carrinho obtido:', cart);

    if (cart.length === 0) {
        console.log('Carrinho vazio. Exibindo mensagem e retornando.');
        document.getElementById('checkout').innerHTML = 'Seu carrinho está vazio. Por favor, adicione itens para finalizar a compra.';
        document.getElementById('mercadopago-btn').innerHTML = ''; // Garante que o container do MP esteja vazio
        // Opcional: Esconder o formulário se o carrinho estiver vazio
        document.querySelector('.payer-details-form').style.display = 'none';
        document.querySelector('.address-details-form').style.display = 'none';
        if (btnFinalizarCompra) btnFinalizarCompra.style.display = 'none';
        return;
    }

    // --- 2. Exibe resumo do carrinho ---
    document.getElementById('checkout').innerHTML = cart.map(p => `
        <div class="checkout-item-resumo">
            <img src="${p.imagemUrl}" alt="${p.nome}" class="checkout-img-resumo">
            <div class="checkout-info-resumo">
                <span>${p.nome}</span>
                <span>R$ ${p.preco.toFixed(2).replace('.', ',')} x ${p.qtd}</span>
            </div>
            <span class="checkout-total-item-resumo">R$ ${(p.preco * p.qtd).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('') + `
    <div class="checkout-total-geral-resumo">
        Total: R$ ${cart.reduce((acc, p) => acc + p.preco * p.qtd, 0).toFixed(2).replace('.', ',')}
    </div>`;

    // --- 3. Listener para o botão "Finalizar Compra" ---
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener('click', async () => {
            console.log('Botão "Finalizar Compra" clicado.');

            // --- 4. Coleta dos valores dos inputs AQUI (DENTRO DO CLIQUE) ---
            // Os valores são lidos APENAS quando o botão é clicado
            const payerEmail = payerEmailInput.value;
            const payerName = payerNameInput.value;
            const payerSurname = payerSurnameInput.value;
            const payerCpf = payerCpfInput.value; // Coletando o valor
            
            const addressCep = addressCepInput.value;
            const addressStreet = addressStreetInput.value;
            const addressNumber = addressNumberInput.value;
            const addressComplement = addressComplementInput.value;
            const addressNeighborhood = addressNeighborhoodInput.value;
            const addressCity = addressCityInput.value;
            const addressState = addressStateInput.value;
            
            // --- 5. Validação dos campos obrigatórios ---
            if (!payerEmail || !payerName || !payerSurname || !payerCpf ||
                !addressCep || !addressStreet || !addressNumber || !addressNeighborhood || !addressCity || !addressState) {
                document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Por favor, preencha todos os dados obrigatórios para continuar.</p>`;
                console.log('Dados incompletos.');
                return; // Impede a continuação se os dados estiverem incompletos
            }

            console.log('Dados do pagador preenchidos e válidos após clique:', payerEmail, payerName, payerSurname);
            console.log('Dados de endereço:', { addressCep, addressStreet, addressNumber, addressComplement, addressNeighborhood, addressCity, addressState });

            // Desabilita o botão para evitar cliques múltiplos enquanto processa
            btnFinalizarCompra.disabled = true;
            document.getElementById('mercadopago-btn').innerHTML = `<p>Processando pagamento...</p>`;

            // --- 6. Chama backend para criar preferência Mercado Pago ---
            try {
                const response = await fetch('https://beckendindustrialtelhas.onrender.com/api/mercadopago-preferencia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart, // Seu carrinho de compras
                        payerEmail: payerEmail,
                        payerName: payerName,
                        payerSurname: payerSurname,
                        payerCpf: payerCpf, 
                        payerAddress: { 
                            cep: addressCep,
                            street: addressStreet,
                            number: addressNumber,
                            complement: addressComplement,
                            neighborhood: addressNeighborhood,
                            city: addressCity,
                            state: addressState
                        }
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
                    
                    // --- 7. Inicializa e Renderiza o Mercado Pago Wallet Brick ---
                    // IMPORTANTE: Use a sua PUBLIC_KEY real do Mercado Pago aqui!
                    const mp = new MercadoPago('APP_USR-1f48557b-5774-4404-b85c-20b00e32d800', {
                        locale: 'pt-BR'
                    });

                    mp.bricks().create("wallet", "mercadopago-btn", {
                        initialization: {
                            preferenceId: id,
                            redirectMode: "self" // 'self' para redirecionar na mesma janela, 'blank' para nova aba
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
                                // Esconde o botão "Finalizar Compra" após o Brick carregar
                                btnFinalizarCompra.style.display = 'none'; 
                                // Opcional: Mostra a div do Mercado Pago se estava escondida
                                document.getElementById('mercadopago-btn').style.display = 'block';
                            },
                            onError: (error) => {
                                console.error('Erro ao carregar o Mercado Pago Wallet Brick:', error);
                                document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Não foi possível carregar os métodos de pagamento. Erro: ${error.message || 'Desconhecido'}</p>`;
                                btnFinalizarCompra.disabled = false; // Reabilita o botão em caso de erro do Brick
                                btnFinalizarCompra.style.display = 'block'; // Mostra o botão original
                            },
                        },
                    });
                } else {
                    console.error('ID da preferência não recebido do backend.');
                    document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Falha ao inicializar o pagamento: ID da preferência ausente.</p>`;
                    btnFinalizarCompra.disabled = false; // Reabilita o botão
                    btnFinalizarCompra.style.display = 'block'; // Mostra o botão original
                }

            } catch (error) {
                console.error('Erro na requisição ao backend para criar preferência:', error);
                document.getElementById('mercadopago-btn').innerHTML = `<p style="color: red;">Erro de conexão com o servidor de pagamento. Por favor, tente novamente.</p>`;
                btnFinalizarCompra.disabled = false; // Reabilita o botão
                btnFinalizarCompra.style.display = 'block'; // Mostra o botão original
            }
        });
    } else {
        console.error('Botão "Finalizar Compra" (#btn-finalizar-compra) não encontrado!');
    }
});