import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Typography, Button, TextField, Paper, Divider, Avatar, Card, CardMedia } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import BookInfo from './BookDetails/BookInfo';
import ReadingStatusCard from './BookDetails/ReadingStatusCard';
import AddCommentForm from './BookDetails/AddCommentForm';
import CommentsSection from './BookDetails/CommentsSection';

const API_BASE_URL = 'http://localhost:8000/api'; 

const BookDetailsPage = ({ mainColor = "#541029", handleReadClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // استخراج الـ id من رابط الصفحة
  const { id: routeBookId } = useParams();

  // --- حالات التحكم في البيانات ---
  const [currentBook, setCurrentBook] = useState(location.state?.book || null);
  const [loadingBook, setLoadingBook] = useState(true); // حالة تحميل للتأكد من وصول البيانات
  const [readingStatus, setReadingStatus] = useState(''); 
  const [loadingStatus, setLoadingStatus] = useState(false); 
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isBookInList, setIsBookInList] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  
  // --- حالة الكتب المشابهة ---
  const [similarBooks, setSimilarBooks] = useState([]);

  // --- حالات الردود والتعديل ---
  const [replyingToId, setReplyingToId] = useState(null); 
  const [activeReplyText, setActiveReplyText] = useState(''); 
  const [editingCommentId, setEditingCommentId] = useState(null); 
  const [activeEditText, setActiveEditText] = useState(''); 
  const [comments, setComments] = useState([]);

  // --- حالات اقتراح كتاب جديد ---
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionAuthor, setSuggestionAuthor] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState([]); 

  // --- فك تشفير التوكن ---
  const token = localStorage.getItem('token');
  let [currentUserId, setCurrentUserId] = useState(localStorage.getItem('user_id') || null);

  if (token && typeof token === 'string') {
    try {
      const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
      const tokenParts = cleanToken.split('.');
      if (tokenParts.length === 3) {
        const base64Url = tokenParts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        const rawId = payload.sub || payload.id || payload.user_id || payload.userId;
        if (rawId) {
          currentUserId = String(rawId).trim(); 
          localStorage.setItem('decoded_user_id', currentUserId);
        }
      }
    } catch (e) { 
      console.error("خطأ التوكن:", e); 
    }
  }

  // تحديث الهوية الاحتياطية للمنتسب
  if (!currentUserId) {
    const backupId = localStorage.getItem('user_id') || localStorage.getItem('decoded_user_id');
    if (backupId) currentUserId = String(backupId).trim();
  }

  // عند انتقال المتصفح لكتاب آخر عبر الاقتراحات، نقوم بتهيئة حالة التحميل
  useEffect(() => {
    setLoadingBook(true);
  }, [routeBookId]);

  // --- جلب البيانات عند تغيير الـ id في الرابط ---
  useEffect(() => {
    if (!token || !routeBookId) return;

    if (!currentUserId) {
      fetch(`${API_BASE_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      .then(res => res.json())
      .then(userData => {
        if (userData && userData.id) {
          const idStr = String(userData.id).trim();
          setCurrentUserId(idStr);
          localStorage.setItem('user_id', idStr); 
        }
      })
      .catch(err => console.error("خطأ في جلب بيانات المستخدم:", err));
    }

    // 1. جلب تفاصيل الكتاب الحالية بناءً على الـ ID الجديد
    fetch(`${API_BASE_URL}/books/${routeBookId}`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
    .then(res => res.json())
    .then(resData => {
      if (resData.success && resData.data) {
        const bookData = resData.data;
        
        setCurrentBook(bookData);
        setAverageRating(bookData.average_rating !== undefined ? Number(bookData.average_rating) : 0);
        
        if (bookData.similar_books && Array.isArray(bookData.similar_books)) {
          setSimilarBooks(bookData.similar_books);
        }

        if (bookData.ratings && Array.isArray(bookData.ratings) && bookData.ratings.length > 0) {
          const userRatingObj = bookData.ratings.find(r => String(r.user_id) === String(currentUserId));
          setUserRating(userRatingObj ? Number(userRatingObj.rating) : 0);
        }
      }
    })
    .catch(err => console.error("خطأ جلب الكتاب:", err))
    .finally(() => {
      setLoadingBook(false); // إنهاء وضع التحميل بأمان بعد استجابة السيرفر
    });

    // 2. جلب التعليقات والمراجعات
    fetch(`${API_BASE_URL}/comments/${routeBookId}`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
    .then(res => res.json())
    .then(resData => { 
      if (resData.success && resData.comments) setComments(resData.comments); 
    })
    .catch(err => console.error(err));

    // 3. جلب حالة قائمة القراءة
    fetch(`${API_BASE_URL}/book_list`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
    .then(res => res.json())
    .then(resData => {
      if (resData.success) {
        const lists = resData.data;
        const bId = Number(routeBookId);
        if (lists['أقرأها الآن']?.some(item => item.book_id === bId)) { setReadingStatus('أقرأها الآن'); setIsBookInList(true); }
        else if (lists['أرغب بقراءتها']?.some(item => item.book_id === bId)) { setReadingStatus('أرغب بقراءتها'); setIsBookInList(true); }
        else if (lists['أنهيتها']?.some(item => item.book_id === bId)) { setReadingStatus('أنهيتها'); setIsBookInList(true); }
        else { setIsBookInList(false); setReadingStatus(''); }
      }
    }).catch(err => console.error(err));

    // 4. جلب قائمة الاقتراحات الخارجية
    fetch(`${API_BASE_URL}/books/${routeBookId}/suggestions`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
    .then(res => res.json())
    .then(resData => {
      if (resData.success && resData.data) {
        setSuggestionsList(resData.data);
      }
    }).catch(err => console.error("خطأ في جلب الاقتراحات:", err));

  }, [routeBookId, token, currentUserId]);

  // --- التوابع البرمجية للعمليات ---
const handleDeleteComment = async (commentId) => {
  // ✅ تم حذف سطر الـ window.confirm من هنا لأن الـ Dialog يقوم بالواجب الآن
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, { 
      method: 'DELETE', 
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
      } 
    });

    if (response.ok) {
      setComments((prev) => 
        prev
          .filter(c => c.id !== commentId)
          .map(c => ({
            ...c,
            replies: c.replies ? c.replies.filter(r => r.id !== commentId) : []
          }))
      );
    } else { 
      // 👈 يمكنك استبدال هذا الـ alert بـ console.error أو تركه فارغاً حتى لا يزعج المستخدم
      console.error("فشلت عملية الحذف من السيرفر."); 
    }
  } catch (e) { 
    console.error(e); 
  }
};

  const handleUpdateComment = async (commentId, newContent) => {
    if (!newContent.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, { 
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }, 
        body: JSON.stringify({ content: newContent }) 
      });
      const data = await response.json();
      if (response.ok) {
        setComments((prev) => prev.map(c => {
          if (c.id === commentId) return { ...c, content: data.comment.content };
          if (c.replies) return { ...c, replies: c.replies.map(r => r.id === commentId ? { ...r, content: data.comment.content } : r) };
          return c;
        }));
        setEditingCommentId(null); setActiveEditText('');
      }
    } catch (e) { console.error(e); }
  };

  const handleAddReply = (commentId, replyText) => {
    if (!replyText.trim() || !token) return;

    fetch(`${API_BASE_URL}/comments/${commentId}/reply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ content: replyText })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.reply) {
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, replies: [...(comment.replies || []), resData.reply] };
            }
            return comment;
          })
        );
        setActiveReplyText(''); setReplyingToId(null);
      }
    })
    .catch(err => console.error("خطأ أثناء إضافة الرد:", err));
  };

  const handleRatingChange = async (newRating) => {
    if (!token) { alert('يرجى تسجيل الدخول أولاً لتقييم الكتاب.'); return; }
    const method = (!newRating || newRating === 0) ? 'DELETE' : 'POST';
    try {
      const response = await fetch(`${API_BASE_URL}/ratings/${currentBook.id}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: method === 'POST' ? JSON.stringify({ rating: newRating }) : undefined
      });
      if (response.ok) setUserRating(newRating || 0);
    } catch (e) { console.error(e); }
  };

  const handleStatusClick = async (targetStatus) => {
    if (!token) { alert('يرجى تسجيل الدخول أولاً.'); return; }
    setLoadingStatus(true);
    try {
      if (readingStatus === targetStatus) {
        const response = await fetch(`${API_BASE_URL}/book_list/${currentBook.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        if ((await response.json()).success) { setReadingStatus(''); setIsBookInList(false); }
      } else {
        const method = isBookInList ? 'PUT' : 'POST';
        const url = isBookInList ? `${API_BASE_URL}/book_list/${currentBook.id}` : `${API_BASE_URL}/book_list`;
        const response = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ book_id: currentBook.id, status: targetStatus }) });
        if (response.ok) { setReadingStatus(targetStatus); setIsBookInList(true); }
      }
    } catch (e) { console.error(e); } finally { setLoadingStatus(false); }
  };

  const handleAddComment = async () => {
    if (!token) { alert('يرجى تسجيل الدخول أولاً لإضافة مراجعة.'); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }, 
        body: JSON.stringify({ book_id: currentBook.id, content: commentText }) 
      });
      const data = await response.json();
      if (response.ok) { setComments((prev) => [data.comment, ...prev]); setCommentText(''); }
    } catch (e) { console.error(e); }
  };

  const handleAddSuggestion = async () => {
    if (!token) { alert('يرجى تسجيل الدخول أولاً لتقديم اقتراح.'); return; }
    if (!suggestionTitle.trim() || !suggestionAuthor.trim()) {
      alert('يرجى ملء حقول العنوان والمؤلف.'); return;
    }

    setLoadingSuggestion(true);
    try {
      const response = await fetch(`${API_BASE_URL}/suggestions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          title: suggestionTitle,
          author: suggestionAuthor,
          description: suggestionDescription,
          related_book_id: currentBook.id 
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert(data.message || 'تم إرسال الاقتراح بنجاح');
        if (data.data) { setSuggestionsList((prev) => [data.data, ...prev]); }
        setSuggestionTitle(''); setSuggestionAuthor(''); setSuggestionDescription('');
      } else { alert('حدث خطأ أثناء إرسال الاقتراح.'); }
    } catch (e) { console.error(e); alert('فشل الاتصال بالسيرفر.'); } finally { setLoadingSuggestion(false); }
  };

  const handleSimilarBookClick = (book) => {
    // تمرير الهوية عبر الرابط والـ state لتحديث البيانات فوراً
    navigate(`/books/${book.id}`, { state: { book: book } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  

  // --- 2. رندرة الصفحة الكاملة فقط عندما تكون البيانات جاهزة بنسبة 100% ---
  return (
  <Box sx={{ bgcolor: '#f4f1ea', minHeight: '100vh', pb: 8, position: 'relative' }} dir="rtl">
    
    {/* 🟢 استبدل من السطر 315 إلى 317 بهذا الـ Box الجديد بالكامل */}
    <Box
      sx={{
        height: 380,
        backgroundImage: `url(/images/header-bg.jpg)`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        overflow: 'hidden',
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(66, 11, 31, 0.3)',
          zIndex: 1
        }
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          width: '100%',
          height: '110px', 
          zIndex: 2, 
        }}
      >
        <path
          fill="#f4f1ea" 
          fillOpacity="1"
          d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
        ></path>
        <path
          d="M0,224L120,208C240,192,480,160,720,176C960,192,1200,256,1320,288L1440,320"
          fill="none"
          stroke="#D4AF37" 
          strokeWidth="5" 
          strokeLinecap="round"
        ></path>
      </Box>
    </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, pt: 9 }}>
        <BookInfo selectedBook={{ ...currentBook, average_rating: averageRating }} mainColor={mainColor} handleReadClick={handleReadClick} />
        <ReadingStatusCard readingStatus={readingStatus} loadingStatus={loadingStatus} mainColor={mainColor} handleStatusClick={handleStatusClick} />
        
        {/* ---------------- قسم اقتراحات قد تعجبك ---------------- */}
        {similarBooks.length > 0 && (
          <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', mb: 4,  border: '3px solid #602134', bgcolor: '#f4f1ea' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: mainColor, mb: 3 }}>
              اقتراحات قد تعجبك
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 3, 
                overflowX: 'auto', 
                pb: 2,
                '&::-webkit-scrollbar': { height: '6px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: '4px' }
              }}
            >
              {similarBooks.map((book) => (
                <Box 
                  key={book.id} 
                  onClick={() => handleSimilarBookClick(book)}
                  sx={{ 
                    minWidth: '140px', 
                    maxWidth: '140px', 
                    cursor: 'pointer', 
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <Card elevation={1} sx={{ borderRadius: '8px', overflow: 'hidden', height: '200px', mb: 1 }}>
                    <CardMedia
                      component="img"
                      height="100%"
                      image={book.cover_img || 'https://via.placeholder.com/140x200?text=No+Cover'}
                      alt={book.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  </Card>
                  <Typography variant="body2" sx={{ fontFamily: 'Cairo', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', color: '#333' }}>
                    {book.title}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: '#666', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {book.author}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
        {/* -------------------------------------------------------------------------------- */}

        <AddCommentForm userRating={userRating} commentText={commentText} setCommentText={setCommentText} mainColor={mainColor} handleRatingChange={handleRatingChange} handleAddComment={handleAddComment} />
        
     {/* كارت تقديم اقتراح كتاب جديد */}
<Paper 
  elevation={0} 
  sx={{ 
    p: 4, 
    borderRadius: '16px', 
    mb: 4, 
    border: '3px solid #602134', 
    bgcolor: '#f4f1ea',
    // إذا لم يكن هناك توكن، يتم تقليل الشفافية وتغيير الخلفية لتبدو رمادية وغير فعالة
    ...(!token && {
 border: '3px solid #602134', 
       borderColor: '#602134',
      pointerEvents: 'none' // يمنع أي تفاعل أو ضغط داخل الكارت
    })
  }}
>
  <Typography 
    variant="h6" 
    sx={{ fontFamily: 'Cairo', fontWeight: 'bold', color: !token ? '#666' : mainColor, mb: 1 }}
  >
    هل تقترح كتاباً مشابهاً؟
  </Typography>
  <Typography variant="body2" sx={{ fontFamily: 'Cairo', mb: 3, color: '#666' }}>
    {!token 
      ? "يرجى تسجيل الدخول أولاً لتتمكن من اقتراح كتب مشابهة."
      : `إذا كنت تعرف كتاباً مشابهاً لـ "${currentBook?.title}" أو تعتقد أنه يثري هذا القسم، شاركنا معلوماته ليتم مراجعته وإضافته.`
    }
  </Typography>
  
  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
    <TextField
      label="عنوان الكتاب المقترح *"
      fullWidth
      variant="outlined"
      value={suggestionTitle}
      onChange={(e) => setSuggestionTitle(e.target.value)}
      disabled={!token} // تعطيل الحقل إذا لم يسجل دخول
      InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
      inputProps={{ style: { fontFamily: 'Cairo' } }}
    />
    <TextField
      label="اسم المؤلف *"
      fullWidth
      variant="outlined"
      value={suggestionAuthor}
      onChange={(e) => setSuggestionAuthor(e.target.value)}
      disabled={!token} // تعطيل الحقل إذا لم يسجل دخول
      InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
      inputProps={{ style: { fontFamily: 'Cairo' } }}
    />
  </Box>
  <TextField
    label="لماذا تقترح هذا الكتاب؟ (وصف قصير)"
    fullWidth
    multiline
    rows={2}
    variant="outlined"
    value={suggestionDescription}
    onChange={(e) => setSuggestionDescription(e.target.value)}
    disabled={!token} // تعطيل الحقل إذا لم يسجل دخول
    InputLabelProps={{ style: { fontFamily: 'Cairo' } }}
    inputProps={{ style: { fontFamily: 'Cairo' } }}
    sx={{ mb: 3 }}
  />
  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
    <Button 
      onClick={handleAddSuggestion} 
      disabled={!token || loadingSuggestion} // تعطيل الزر إذا لم يسجل دخول أو أثناء التحميل
      variant="contained" 
      sx={{ 
        fontFamily: 'Cairo', 
        bgcolor: !token ? '#999' : mainColor, 
        px: 4, 
        py: 1, 
        borderRadius: '24px', 
        '&:hover': { bgcolor: !token ? '#999' : mainColor }, 
        boxShadow: 'none' 
      }}
    >
      {loadingSuggestion ? 'جاري إرسال اقتراحك...' : 'إرسال الاقتراح'}
    </Button>
  </Box>
</Paper>

        <CommentsSection 
          comments={comments} 
          mainColor={mainColor} 
          currentUserId={currentUserId}
          editingCommentId={editingCommentId} setEditingCommentId={setEditingCommentId}
          activeEditText={activeEditText} setActiveEditText={setActiveEditText}
          replyingToId={replyingToId} setReplyingToId={setReplyingToId}
          activeReplyText={activeReplyText} setActiveReplyText={setActiveReplyText}
          handleDeleteComment={handleDeleteComment} handleUpdateComment={handleUpdateComment} handleAddReply={handleAddReply} 
        />
      </Container>
    </Box>
  );
};

export default BookDetailsPage;