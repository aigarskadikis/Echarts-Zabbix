class WidgetEcharts extends CWidget {
    
    static CONFIG_TYPE_JSON = 0;
    static CONFIG_TYPE_JAVASCRIPT = 1;

    onInitialize() {
        super.onInitialize();

        this._refresh_frame = null;
        this._chart_container = null;
        this._chart = null;
        this._config = null;
        this._items_data = {};
        this._items_meta = {};
        this._context = {
            panel: {
                data: {
                    series: []
                },
                chart: null
            },
            zabbix: {
                items: {},
                items_meta: {},
                locationService: {
                    replace: (url) => {
                        window.location.href = url;
                    }
                }
            },
            // Helpers para facilitar a criação de gráficos
            helpers: {
                // Converte timestamp para data formatada
                formatDate: (timestamp) => {
                    return new Date(timestamp * 1000).toLocaleString();
                },
                // Formata número com casas decimais
                formatNumber: (value, decimals = 2) => {
                    return Number(value).toFixed(decimals);
                },
                // Converte bytes para unidade mais apropriada
                formatBytes: (bytes) => {
                    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
                    let value = Math.abs(bytes);
                    let unitIndex = 0;
                    
                    while (value >= 1024 && unitIndex < units.length - 1) {
                        value /= 1024;
                        unitIndex++;
                    }
                    
                    return value.toFixed(2) + ' ' + units[unitIndex];
                },
                // Gera cores dinâmicas
                generateColors: (count) => {
                    const colors = [
                        '#5470c6', '#91cc75', '#fac858', '#ee6666',
                        '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
                    ];
                    return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
                },
                // Cria gradiente
                createGradient: (color) => {
                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: echarts.color.lighten(color, 0.2) },
                        { offset: 1, color: echarts.color.darken(color, 0.2) }
                    ]);
                }
            }
        };
    }

    processUpdateResponse(response) {
        console.log('Dados recebidos (raw):', response);
        
        // Verifica se a resposta é válida
        if (!response || !response.items_data) {
            console.error('Dados ausentes na resposta:', response);
            return;
        }

        // Atualiza os dados internos
        this._items_data = response.items_data || {};
        this._items_meta = response.items_meta || {};
        
        // Log seguro sem estruturas circulares
        console.log('Dados processados:', {
            items_data: {...this._items_data},
            items_meta: {...this._items_meta}
        });

        // Prepara os campos para o contexto
        const fields = [];
        for (const [itemid, value] of Object.entries(this._items_data)) {
            const numericValue = parseFloat(value);
            
            if (isNaN(numericValue)) {
                console.warn(`Valor inválido para o item ${itemid}:`, value);
                continue;
            }
            
            // Obtém os metadados do item
            const meta = this._items_meta[itemid];
            
            // Log seguro dos dados do item
            console.log('Processando item:', {
                itemid,
                value,
                numericValue,
                meta: meta ? {...meta} : 'Metadados não encontrados'
            });

            // Se não houver metadados, usa valores padrão
            const field = {
                id: itemid,
                name: meta?.name || `Item ${itemid}`,
                value: numericValue,
                values: [numericValue],
                units: meta?.units || '',
                host: meta?.host || 'Unknown host',
                value_type: meta?.value_type || '0',
                delay: meta?.delay || '0',
                history: meta?.history || '7d',
                lastclock: meta?.lastclock || ''
            };
            
            console.log(`Campo processado para item ${itemid}:`, {...field});
            fields.push(field);
        }

        // Atualiza o contexto
        this._context.panel.data.series = [{
            fields: fields
        }];
        
        this._context.zabbix.items = {...this._items_data};
        this._context.zabbix.items_meta = {...this._items_meta};
        
        // Log seguro do contexto final
        const safeContext = {
            panel: {
                data: {
                    series: this._context.panel.data.series
                }
            },
            zabbix: {
                items: {...this._context.zabbix.items},
                items_meta: {...this._context.zabbix.items_meta}
            }
        };
        
        console.log('Contexto final:', safeContext);

        // Processa a configuração
        if (response.fields_values && response.fields_values.echarts_config) {
            this._config = response.fields_values.echarts_config;
            this._config_type = parseInt(response.fields_values.config_type) || WidgetEcharts.CONFIG_TYPE_JSON;
            console.log('Configuração carregada:', {
                config: this._config,
                type: this._config_type
            });
        }
        else {
            console.warn('Configuração não encontrada na resposta');
        }
        
        // Atualiza o gráfico
        this.setContents(response);
    }

    setContents(response) {
        if (this._chart === null) {
            super.setContents(response);

            this._chart_container = this._body.querySelector('.chart');
            if (!this._chart_container) {
                console.error('Container do gráfico não encontrado');
                return;
            }

            this._chart_container.style.height = `${this._getContentsSize().height}px`;
            
            try {
                // Inicializa com tema escuro e renderer automático
                this._chart = echarts.init(this._chart_container, 'dark', {
                    renderer: 'canvas',
                    useDirtyRect: true
                });
                this._context.panel.chart = this._chart;

                // Configuração base
                this._chart.setOption({
                    backgroundColor: 'transparent',
                    textStyle: {
                        color: '#fff'
                    }
                });

                // Registra eventos
                this._chart.on('click', (params) => {
                    console.log('Clique no gráfico:', params);
                });

                this._resizeChart();
            }
            catch (error) {
                console.error('Erro ao inicializar o gráfico:', error);
                return;
            }
        }

        this._updateChart();
    }

    _updateChart() {
        if (!this._config) {
            console.error('Configuração não definida');
            return;
        }

        try {
            let options;
            
            if (this._config_type === WidgetEcharts.CONFIG_TYPE_JAVASCRIPT) {
                console.log('Executando configuração JavaScript');
                
                const series = this._context.panel.data.series[0];
                console.log('Dados da série:', series);
                
                if (!series || !series.fields || !series.fields.length) {
                    console.error('Nenhum dado disponível para o gráfico:', {
                        series,
                        context: this._context
                    });
                    return;
                }

                // Executa o código do usuário com acesso ao contexto e helpers
                const configFunction = new Function('context', this._config);
                options = configFunction(this._context);
                console.log('Opções geradas:', options);
            }
            else {
                console.log('Processando configuração JSON');
                let config = this._config;
                config = config.replace(/\${([^}]+)}/g, (match, path) => {
                    const parts = path.split('.');
                    if (parts[0] === 'item' && this._items_data[parts[1]]) {
                        return this._items_data[parts[1]];
                    }
                    return '0';
                });
                options = JSON.parse(config);
            }

            if (!options) {
                console.error('Nenhuma opção gerada');
                return;
            }

            // Mescla com opções base
            options = {
                ...options,
                backgroundColor: 'transparent',
                textStyle: {
                    color: '#fff'
                },
                // Configurações padrão de animação
                animation: true,
                animationThreshold: 2000,
                animationDuration: 1000,
                animationEasing: 'cubicOut',
                // Configurações responsivas
                grid: options.grid || {
                    containLabel: true,
                    left: '3%',
                    right: '4%',
                    bottom: '3%'
                }
            };

            console.log('Aplicando opções ao gráfico:', options);
            this._chart.setOption(options, true);
        }
        catch (error) {
            console.error('Erro ao atualizar o gráfico:', error);
            console.error('Stack:', error.stack);
        }
    }

    onResize() {
        super.onResize();

        if (this._state === WIDGET_STATE_ACTIVE) {
            this._resizeChart();
        }
    }

    _resizeChart() {
        if (this._chart) {
            this._chart.resize();
        }
    }
}
