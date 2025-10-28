document.addEventListener('DOMContentLoaded', () => {
    // Carrega dados salvos em todos os campos da página atual
    const formFields = document.querySelectorAll('.form-control');
    formFields.forEach(field => {
        const savedValue = localStorage.getItem(field.id);
        if (savedValue) {
            field.value = savedValue;
        }
        // Salva dados automaticamente ao digitar
        field.addEventListener('input', () => {
            localStorage.setItem(field.id, field.value);
        });
    });

    // Função genérica de validação
    const validateField = (fieldId) => {
        const input = document.getElementById(fieldId);
        if (!input) return false;
        
        input.classList.remove('is-invalid', 'is-valid');
        let isValid = false;

        switch (input.type) {
            case 'text':
            case 'select-one':
                isValid = input.value.trim() !== '';
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                break;
            case 'date':
                const birthDate = new Date(input.value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                isValid = age >= 18;
                break;
            case 'url':
                 try { new URL(input.value); isValid = true; } catch (_) { isValid = false; }
                 break;
        }
        
        // Validações específicas por ID
        if (input.id === 'fullName' || input.id === 'personalRefName' || input.id === 'profRefName') isValid = input.value.trim().length >= 3;
        if (input.id === 'cpf') isValid = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(input.value);
        if (input.id === 'rg') isValid = input.value.trim().length >= 7;
        if (input.id === 'phone' || input.id === 'personalRefPhone' || input.id === 'profRefPhone') isValid = /^\(\d{2}\)\s\d{5}\-\d{4}$/.test(input.value);
        if (input.id === 'cep') isValid = /^\d{5}\-\d{3}$/.test(input.value);
        
        if (isValid) {
            input.classList.add('is-valid');
        } else {
            input.classList.add('is-invalid');
        }
        return isValid;
    };
    
    // Função para navegar para a próxima etapa
    window.goToNextStep = (currentFields, nextPage) => {
        const isSectionValid = currentFields.every(validateField);
        if (isSectionValid) {
            window.location.href = nextPage;
        } else {
            // Foca no primeiro campo com erro
            const firstInvalid = document.querySelector('.is-invalid');
            if (firstInvalid) firstInvalid.focus();
        }
    };
    
    // Avanço automático ao preencher o último campo
    window.setupAutoAdvance = (fields, nextPage) => {
        const lastField = document.getElementById(fields[fields.length - 1]);
        if (lastField) {
            const eventType = lastField.tagName === 'SELECT' ? 'change' : 'blur';
            lastField.addEventListener(eventType, () => goToNextStep(fields, nextPage));
        }
    };

    // Máscaras
    const applyMask = (elementId, maskFunction) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('input', (e) => e.target.value = maskFunction(e.target.value));
        }
    };
    applyMask('cpf', v => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'));
    applyMask('phone', v => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'));
    applyMask('personalRefPhone', v => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'));
    applyMask('profRefPhone', v => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'));
    applyMask('cep', v => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2'));

    // API de CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('blur', async (e) => {
            const cep = e.target.value.replace(/\D/g, '');
            if (cep.length === 8) {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                if (response.ok) {
                    const data = await response.json();
                    if (!data.erro) {
                        document.getElementById('street').value = data.logouro; localStorage.setItem('street', data.logouro);
                        document.getElementById('neighborhood').value = data.bairro; localStorage.setItem('neighborhood', data.bairro);
                        document.getElementById('city').value = data.localidade; localStorage.setItem('city', data.localidade);
                        document.getElementById('state').value = data.uf; localStorage.setItem('state', data.uf);
                        document.getElementById('number').focus();
                    }
                }
            }
        });
    }

    // Função de envio final para WhatsApp
    window.submitToWhatsApp = (requiredFields) => {
        const isFormValid = requiredFields.every(validateField);
        if(!isFormValid) {
            alert('Ainda há campos obrigatórios para preencher.');
            return;
        }

        let message = `*--- NOVO CADASTRO DE CLIENTE ---*\n\n`;
        message += `*DADOS PESSOAIS:*\n`;
        message += `Nome: ${localStorage.getItem('fullName') || ''}\n`;
        message += `CPF: ${localStorage.getItem('cpf') || ''}\n`;
        message += `RG: ${localStorage.getItem('rg') || ''}\n`;
        message += `Nascimento: ${localStorage.getItem('birthDate') || ''}\n`;
        message += `Telefone: ${localStorage.getItem('phone') || ''}\n`;
        message += `E-mail: ${localStorage.getItem('email') || ''}\n\n`;

        message += `*ENDEREÇO:*\n`;
        message += `CEP: ${localStorage.getItem('cep') || ''}\n`;
        message += `Endereço: ${localStorage.getItem('street') || ''}, ${localStorage.getItem('number') || ''}\n`;
        message += `Bairro: ${localStorage.getItem('neighborhood') || ''}\n`;
        message += `Cidade/UF: ${localStorage.getItem('city') || ''}/${localStorage.getItem('state') || ''}\n`;
        message += `Tempo de Moradia: ${localStorage.getItem('residenceTime') || ''}\n\n`;

        message += `*DADOS FINANCEIROS:*\n`;
        message += `Faixa Salarial: ${localStorage.getItem('salaryRange') || ''}\n\n`;

        message += `*REFERÊNCIAS:*\n`;
        message += `Pessoal: ${localStorage.getItem('personalRefName') || ''} - ${localStorage.getItem('personalRefPhone') || ''}\n`;
        message += `Profissional: ${localStorage.getItem('profRefName') || ''} - ${localStorage.getItem('profRefPhone') || ''}\n\n`;
        
        message += `*REDES SOCIAIS:*\n`;
        message += `1: ${localStorage.getItem('social1') || ''}\n`;
        message += `2: ${localStorage.getItem('social2') || ''}\n`;
        message += `3: ${localStorage.getItem('social3') || ''}\n`;
        if(localStorage.getItem('social4')) message += `4: ${localStorage.getItem('social4')}\n`;
        if(localStorage.getItem('social5')) message += `5: ${localStorage.getItem('social5')}\n`;
        if(localStorage.getItem('social6')) message += `6: ${localStorage.getItem('social6')}\n`;

        const whatsappUrl = `https://wa.me/5544998408460?text=${encodeURIComponent(message)}`;
        
        alert('Cadastro finalizado! Você será redirecionado para o WhatsApp para enviar os dados.');
        localStorage.clear(); // Limpa os dados após enviar
        window.open(whatsappUrl, '_blank');
    };
});