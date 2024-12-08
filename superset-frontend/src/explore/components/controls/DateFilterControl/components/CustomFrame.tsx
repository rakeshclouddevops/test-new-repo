/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect } from 'react';
import { t } from '@superset-ui/core';
import moment from 'moment';
import { Col, Row } from 'src/components';
import { DateRangePicker } from 'rsuite';
import Select from 'src/components/Select/Select';
import { InfoTooltipWithTrigger } from '@superset-ui/chart-controls';
import {
  SINCE_MODE_OPTIONS,
  MOMENT_FORMAT,
  customTimeRangeDecode,
  customTimeRangeEncode,
} from 'src/explore/components/controls/DateFilterControl/utils';
import { FrameComponentProps } from 'src/explore/components/controls/DateFilterControl/types';
import 'rsuite/DateRangePicker/styles/index.css';

export function CustomFrame(props: FrameComponentProps) {
  const { customRange, matchedFlag } = customTimeRangeDecode(props.value);
  if (!matchedFlag) {
    props.onChange(customTimeRangeEncode(customRange));
  }
  const { sinceDatetime, untilDatetime, sinceMode } = { ...customRange };

  // Initialize with the dates from props or default to today
  const [dateRange, setDateRange] = useState<[Date, Date]>(() => {
    const start = sinceDatetime ? new Date(sinceDatetime) : new Date();
    const end = untilDatetime ? new Date(untilDatetime) : new Date();
    end.setHours(23, 59, 59);
    return [start, end];
  });

  // Update dateRange when props change
  useEffect(() => {
    if (sinceDatetime && untilDatetime) {
      const start = new Date(sinceDatetime);
      const end = new Date(untilDatetime);
      end.setHours(23, 59, 59);
      setDateRange([start, end]);
    }
  }, [sinceDatetime, untilDatetime]);

  const handleDateRangeChange = (dates: [Date, Date] | null) => {
    if (!dates) return;

    const [startDate, endDate] = dates;
    // Set end date to end of day
    const endDateWithTime = new Date(endDate);
    endDateWithTime.setHours(23, 59, 59);

    setDateRange([startDate, endDateWithTime]);

    // Format dates for the parent component
    const formattedStartDate = moment(startDate).format(MOMENT_FORMAT);
    const formattedEndDate = moment(endDateWithTime).format(MOMENT_FORMAT);

    // Update the parent component
    props.onChange(
      customTimeRangeEncode({
        ...customRange,
        sinceDatetime: formattedStartDate,
        untilDatetime: formattedEndDate,
      }),
    );
  };

  const containerStyles = {
    position: 'relative' as const,
    zIndex: 1,
  };

  const datePickerStyles = {
    position: 'relative' as const,
    zIndex: 9999,
    width: '100%',
  };

  const datePickerWrapperStyles = {
    position: 'relative' as const,
    marginTop: '8px',
    width: '100%',
  };

  return (
    <div data-test="custom-frame" style={containerStyles}>
      <div className="section-title">{t('Configure custom time range')}</div>
      <Row gutter={24}>
        <Col span={24}>
          <div className="control-label">
            {t('Date Range')}{' '}
            <InfoTooltipWithTrigger
              tooltip={t('Select start and end date/time')}
              placement="right"
            />
          </div>
          <Select
            ariaLabel={t('Date Range Type')}
            options={SINCE_MODE_OPTIONS}
            value={sinceMode}
          />
          {sinceMode === 'specific' && (
            <div style={datePickerWrapperStyles}>
              <DateRangePicker
                onChange={handleDateRangeChange}
                value={dateRange}
                format="yyyy-MM-dd HH:mm:ss"
                style={datePickerStyles}
                placement="auto"
                container={() => document.body}
                menuStyle={{ zIndex: 9999 }}
                onOpen={() => setDateRange([null, null])}
                cleanable
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}
