# Widget ECharts para Zabbix - [Monzphere](https://monzphere.com)

Este módulo adiciona um widget personalizável ao Zabbix que permite criar gráficos interativos usando a biblioteca ECharts.

## 🚀 Funcionalidades

- Suporte a múltiplos tipos de gráficos
- Configuração via JSON ou JavaScript
- Personalização completa de cores, estilos e animações
- Atualização em tempo real
- Suporte a temas claro/escuro

## 📊 Exemplos de Gráficos

### 1. Gauge (Medidor)

```javascript
const field = context.panel.data.series[0].fields[0];
return {
    series: [{
        type: 'gauge',
        radius: '100%',
        progress: {
            show: true,
            width: 18
        },
        axisLine: {
            lineStyle: {
                width: 18,
                color: [
                    [0.2, '#91cc75'],  // Verde até 20%
                    [0.8, '#fac858'],  // Amarelo até 80%
                    [1, '#ee6666']     // Vermelho até 100%
                ]
            }
        },
        axisTick: { show: false },
        splitLine: {
            length: 12,
            lineStyle: { width: 2, color: '#999' }
        },
        pointer: { show: true },
        title: {
            show: true,
            fontSize: 14
        },
        detail: {
            valueAnimation: true,
            fontSize: 30,
            offsetCenter: [0, '70%'],
            formatter: function(value) {
                return value.toFixed(2) + field.units;
            }
        },
        data: [{
            value: field.value,
            name: field.name
        }]
    }]
};
```

### 2. Gráfico de Barras com Gradiente

```javascript
const field = context.panel.data.series[0].fields[0];
return {
    tooltip: {
        trigger: 'axis',
        formatter: function(params) {
            return `${field.name}: ${params[0].value.toFixed(2)}${field.units}`;
        }
    },
    xAxis: {
        type: 'category',
        data: [field.name]
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: function(value) {
                return value.toFixed(2) + field.units;
            }
        }
    },
    series: [{
        data: [{
            value: field.value,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                ])
            }
        }],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
        }
    }]
};
```

### 3. Gráfico de Área com Gradiente

```javascript
const field = context.panel.data.series[0].fields[0];
return {
    tooltip: {
        trigger: 'axis'
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Atual']
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: function(value) {
                return value.toFixed(2) + field.units;
            }
        }
    },
    series: [{
        name: field.name,
        type: 'line',
        smooth: true,
        areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgb(128, 255, 165)' },
                { offset: 1, color: 'rgb(1, 191, 236)' }
            ])
        },
        emphasis: {
            focus: 'series'
        },
        data: [field.value]
    }]
};
```

### 4. Gráfico de Pizza

```javascript
const field = context.panel.data.series[0].fields[0];
const remaining = 100 - field.value;
return {
    tooltip: {
        trigger: 'item'
    },
    series: [{
        name: field.name,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
        },
        label: {
            show: true,
            formatter: function(params) {
                return params.value.toFixed(2) + field.units;
            }
        },
        data: [
            { value: field.value, name: field.name },
            { value: remaining, name: 'Restante' }
        ]
    }]
};
```

## 🎨 Personalização

### Cores
- Use cores hexadecimais: `'#91cc75'`
- Use gradientes:
```javascript
new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: '#83bff6' },
    { offset: 1, color: '#188df0' }
])
```

### Formatação de Números
```javascript
// 2 casas decimais
formatter: function(value) {
    return value.toFixed(2) + field.units;
}

// Usando helper do contexto
formatter: function(value) {
    return context.helpers.formatNumber(value, 2) + field.units;
}
```

### Posicionamento
```javascript
// Centralizado
offsetCenter: [0, '70%']

// Grade personalizada
grid: {
    top: '5%',
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
}
```

## 🔧 Helpers Disponíveis

```javascript
// Formatar data
context.helpers.formatDate(timestamp)

// Formatar número
context.helpers.formatNumber(value, decimals)

// Formatar bytes
context.helpers.formatBytes(bytes)

// Gerar cores
context.helpers.generateColors(count)

// Criar gradiente
context.helpers.createGradient(color)
```

## 📝 Dicas

1. **Tema Escuro/Claro**
   - O widget automaticamente se adapta ao tema do Zabbix
   - Use cores contrastantes para melhor visibilidade

2. **Responsividade**
   - Os gráficos são automaticamente redimensionados
   - Use porcentagens para dimensões relativas

3. **Performance**
   - Evite animações complexas em atualizações frequentes
   - Use `animation: false` para melhor performance

4. **Debug**
   - Verifique o console do navegador para logs detalhados
   - Use o modo de debug para informações adicionais

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, sinta-se à vontade para submeter pull requests.

## 📄 Licença

Este projeto está licenciado sob a GNU General Public License v2.0 - veja o arquivo [LICENSE](LICENSE) para detalhes. 
