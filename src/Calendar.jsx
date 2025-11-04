import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, Plus, X } from 'lucide-react';

// Sample events data
const initialEvents = [
  {
    id: 1,
    title: "Team Meeting",
    date: "2025-11-05",
    time: "10:00",
    duration: 60,
    color: "#3B82F6"
  },
  {
    id: 2,
    title: "Project Deadline",
    date: "2025-11-05",
    time: "10:30",
    duration: 30,
    color: "#EF4444"
  },
  {
    id: 3,
    title: "Client Presentation",
    date: "2025-11-12",
    time: "14:00",
    duration: 90,
    color: "#10B981"
  },
  {
    id: 4,
    title: "Code Review",
    date: "2025-11-15",
    time: "11:00",
    duration: 45,
    color: "#8B5CF6"
  },
  {
    id: 5,
    title: "Lunch Break",
    date: "2025-11-04",
    time: "12:00",
    duration: 60,
    color: "#F59E0B"
  }
];

const eventColors = [
  "#3B82F6", "#EF4444", "#10B981", "#8B5CF6", 
  "#F59E0B", "#06B6D4", "#EC4899", "#6366F1"
];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '09:00',
    duration: 60,
    color: eventColors[0]
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getPrevMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 0).getDate();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const checkEventConflicts = (dateEvents) => {
    if (dateEvents.length < 2) return [];
    
    const conflicts = [];
    for (let i = 0; i < dateEvents.length; i++) {
      for (let j = i + 1; j < dateEvents.length; j++) {
        const event1 = dateEvents[i];
        const event2 = dateEvents[j];
        
        const time1 = parseInt(event1.time.split(':')[0]) * 60 + parseInt(event1.time.split(':')[1]);
        const time2 = parseInt(event2.time.split(':')[0]) * 60 + parseInt(event2.time.split(':')[1]);
        const end1 = time1 + event1.duration;
        const end2 = time2 + event2.duration;
        
        if ((time1 < end2 && end1 > time2)) {
          if (!conflicts.includes(event1.id)) conflicts.push(event1.id);
          if (!conflicts.includes(event2.id)) conflicts.push(event2.id);
        }
      }
    }
    return conflicts;
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!selectedDate || !newEvent.title.trim()) return;

    const event = {
      id: Date.now(),
      title: newEvent.title,
      date: formatDate(selectedDate),
      time: newEvent.time,
      duration: parseInt(newEvent.duration),
      color: newEvent.color
    };

    setEvents([...events, event]);
    setShowModal(false);
    setNewEvent({
      title: '',
      time: '09:00',
      duration: 60,
      color: eventColors[0]
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const openAddEventModal = () => {
    setShowModal(true);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = getPrevMonthDays(currentDate);
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          <div className="day-number">{day}</div>
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      const dateEvents = getEventsForDate(date);
      const conflicts = checkEventConflicts(dateEvents);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          <div className="day-number">{day}</div>
          {dateEvents.length > 0 && (
            <div className="events-container">
              {dateEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className={`event-pill ${conflicts.includes(event.id) ? 'conflict' : ''}`}
                  style={{ backgroundColor: event.color }}
                  title={`${event.title} - ${event.time}`}
                >
                  {event.title}
                </div>
              ))}
              {dateEvents.length > 3 && (
                <div className="more-events">+{dateEvents.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Next month days to complete the grid
    const totalCells = days.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="calendar-day other-month">
          <div className="day-number">{i}</div>
        </div>
      );
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedDateConflicts = checkEventConflicts(selectedDateEvents);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="header-left">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h1>Event Calendar</h1>
        </div>
        <div className="month-navigation">
          <button onClick={() => navigateMonth(-1)} className="nav-button">
            <ChevronLeft />
          </button>
          <h2 className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={() => navigateMonth(1)} className="nav-button">
            <ChevronRight />
          </button>
        </div>
        <button 
          onClick={() => {
            setCurrentDate(new Date());
            setSelectedDate(null);
          }}
          className="today-button"
        >
          Today
        </button>
      </div>

      <div className="calendar-wrapper">
        <div className="calendar-grid">
          <div className="weekday-header">
            {daysOfWeek.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="days-grid">
            {renderCalendarDays()}
          </div>
        </div>

        {selectedDate && (
          <div className="sidebar">
            <div className="sidebar-header">
              <h3 className="sidebar-title">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <button onClick={openAddEventModal} className="add-event-btn">
                <Plus size={20} />
                Add Event
              </button>
            </div>
            
            {selectedDateEvents.length === 0 ? (
              <div className="no-events-container">
                <p className="no-events">No events scheduled</p>
                <button onClick={openAddEventModal} className="add-first-event">
                  <Plus size={18} />
                  Create your first event
                </button>
              </div>
            ) : (
              <div className="events-list">
                {selectedDateConflicts.length > 0 && (
                  <div className="conflict-warning">
                    <AlertCircle size={18} />
                    <span>Time conflicts detected!</span>
                  </div>
                )}
                {selectedDateEvents.map(event => (
                  <div 
                    key={event.id} 
                    className={`event-card ${selectedDateConflicts.includes(event.id) ? 'has-conflict' : ''}`}
                    style={{ borderLeftColor: event.color }}
                  >
                    <div className="event-header">
                      <h4>{event.title}</h4>
                      {selectedDateConflicts.includes(event.id) && (
                        <span className="conflict-badge">Conflict</span>
                      )}
                    </div>
                    <div className="event-details">
                      <Clock size={14} />
                      <span>{event.time} ({event.duration} min)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Event</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                    min="15"
                    step="15"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {eventColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${newEvent.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewEvent({...newEvent, color})}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.9) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .calendar-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          animation: fadeIn 0.5s ease-out;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.6s ease-out;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .calendar-header h1 {
          font-size: 1.75rem;
          color: #1a1a1a;
        }

        .month-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .current-month {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          min-width: 250px;
          text-align: center;
        }

        .nav-button, .today-button {
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 12px;
          background: #667eea;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-button:hover, .today-button:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .nav-button:active, .today-button:active {
          transform: translateY(0);
        }

        .calendar-wrapper {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.7s ease-out;
        }

        .calendar-grid {
          flex: 1;
        }

        .weekday-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .weekday {
          text-align: center;
          font-weight: 600;
          color: #667eea;
          padding: 1rem;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }

        .calendar-day {
          min-height: 120px;
          padding: 0.75rem;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          position: relative;
          overflow: hidden;
        }

        .calendar-day::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea15, #764ba215);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .calendar-day:hover::before {
          opacity: 1;
        }

        .calendar-day:hover {
          border-color: #667eea;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
          transform: translateY(-4px);
        }

        .calendar-day.other-month {
          background: #fafafa;
          opacity: 0.5;
        }

        .calendar-day.other-month .day-number {
          color: #999;
        }

        .calendar-day.other-month:hover {
          border-color: #f0f0f0;
          box-shadow: none;
          transform: none;
        }

        .calendar-day.today {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea15, #764ba215);
          animation: pulse 2s infinite;
        }

        .calendar-day.selected {
          border-color: #764ba2;
          background: linear-gradient(135deg, #667eea25, #764ba225);
          box-shadow: 0 8px 20px rgba(118, 75, 162, 0.3);
        }

        .day-number {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .events-container {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          position: relative;
          z-index: 1;
        }

        .event-pill {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          color: white;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideIn 0.3s ease-out;
        }

        .event-pill:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .event-pill.conflict {
          position: relative;
          border: 2px solid #EF4444;
          animation: pulse 2s infinite;
        }

        .more-events {
          font-size: 0.75rem;
          color: #667eea;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .sidebar {
          border-left: 2px solid #f0f0f0;
          padding-left: 2rem;
          animation: slideIn 0.4s ease-out;
        }

        .sidebar-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .sidebar-title {
          font-size: 1.25rem;
          color: #1a1a1a;
        }

        .add-event-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .add-event-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .no-events-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
        }

        .no-events {
          color: #666;
          text-align: center;
          font-style: italic;
        }

        .add-first-event {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .add-first-event:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .conflict-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #FEE2E2;
          border: 1px solid #EF4444;
          border-radius: 8px;
          color: #991B1B;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
          animation: fadeIn 0.3s ease-out;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .event-card {
          padding: 1rem;
          border-left: 4px solid;
          border-radius: 8px;
          background: #f9fafb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeIn 0.4s ease-out;
        }

        .event-card:hover {
          background: #f3f4f6;
          transform: translateX(6px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .event-card.has-conflict {
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .event-card h4 {
          font-size: 1rem;
          color: #1a1a1a;
        }

        .conflict-badge {
          padding: 0.25rem 0.5rem;
          background: #EF4444;
          color: white;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .event-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.875rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          animation: modalFadeIn 0.3s ease-out;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #1a1a1a;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.9rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .color-picker {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .color-option {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: #1a1a1a;
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .cancel-btn, .submit-btn {
          flex: 1;
          padding: 0.875rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #1a1a1a;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:active, .cancel-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 1024px) {
          .calendar-wrapper {
            grid-template-columns: 1fr;
          }

          .sidebar {
            border-left: none;
            border-top: 2px solid #f0f0f0;
            padding-left: 0;
            padding-top: 2rem;
          }
        }

        @media (max-width: 768px) {
          .calendar-container {
            padding: 1rem;
          }

          .calendar-header {
            flex-direction: column;
            gap: 1rem;
          }

          .month-navigation {
            width: 100%;
            justify-content: center;
          }

          .calendar-day {
            min-height: 80px;
          }

          .modal-content {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;