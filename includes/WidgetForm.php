<?php
       
namespace Modules\EchartsWidget\Includes;

use Zabbix\Widgets\{
    CWidgetField,
    CWidgetForm
};

use Zabbix\Widgets\Fields\{
    CWidgetFieldMultiSelectItem,
    CWidgetFieldTextArea,
    CWidgetFieldSelect
};

/**
 * ECharts widget form.
 */
class WidgetForm extends CWidgetForm {

    public const CONFIG_TYPE_JSON = 0;
    public const CONFIG_TYPE_JAVASCRIPT = 1;

    public function addFields(): self {
        return $this
            ->addField(
                (new CWidgetFieldMultiSelectItem('itemids', _('Items')))
                    ->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
            )
            ->addField(
                (new CWidgetFieldSelect('config_type', _('Configuration Type'), [
                    self::CONFIG_TYPE_JSON => _('JSON'),
                    self::CONFIG_TYPE_JAVASCRIPT => _('JavaScript')
                ]))
                    ->setFlags(CWidgetField::FLAG_NOT_EMPTY)
                    ->setDefault(self::CONFIG_TYPE_JAVASCRIPT)
            )
            ->addField(
                (new CWidgetFieldTextArea('echarts_config', _('ECharts Configuration')))
                    ->setFlags(CWidgetField::FLAG_NOT_EMPTY | CWidgetField::FLAG_LABEL_ASTERISK)
            );
    }
}