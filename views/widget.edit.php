<?php declare(strict_types = 0);
/*
** Zabbix
** Copyright (C) 2001-2023 Zabbix SIA
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**/


/**
 * ECharts widget form view.
 *
 * @var CView $this
 * @var array $data
 */

use Modules\EchartsWidget\Includes\WidgetForm;

$form = new CWidgetFormView($data);

$form
	->addField(
		new CWidgetFieldMultiSelectItemView($data['fields']['itemids'])
	)
	->addField(
		new CWidgetFieldSelectView($data['fields']['config_type'])
	)
	->addField(
		new CWidgetFieldTextAreaView($data['fields']['echarts_config'])
	)
	->show();

