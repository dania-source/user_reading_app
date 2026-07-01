import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Typography, Button, TextField, Paper, CircularProgress, Avatar, Card, CardMedia } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import BookInfo from './BookDetails/BookInfo';
import ReadingStatusCard from './BookDetails/ReadingStatusCard';
import AddCommentForm from './BookDetails/AddCommentForm';
import CommentsSection from './BookDetails/CommentsSection';
import { Snackbar, Alert } from '@mui/material';
// تأكد من استيراد المكونات الإضافية من MUI في ملف الأب
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
  const [page, setPage] = useState(1);
  
  // --- حالة الكتب المشابهة ---
  const [similarBooks, setSimilarBooks] = useState([]);

  // --- حالات الردود والتعديل ---
  const [replyingToId, setReplyingToId] = useState(null); 
  const [activeReplyText, setActiveReplyText] = useState(''); 
  const [editingCommentId, setEditingCommentId] = useState(null); 
  const [activeEditText, setActiveEditText] = useState(''); 
  const [comments, setComments] = useState([]);
const [showToast, setShowToast] = useState(false);
  // --- حالات اقتراح كتاب جديد ---
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionAuthor, setSuggestionAuthor] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState([]); 
const [openPaymentPopup, setOpenPaymentPopup] = useState(false);
const [paymentLoading, setPaymentLoading] = useState(false);
const [paymentData, setPaymentData] = useState(null); 
const [alertOpen, setAlertOpen] = useState(false);
const [alertMessage, setAlertMessage] = useState('');// لحفظ بيانات الدفع الراجع من checkout
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
const { id } = useParams();

  useEffect(() => {
    // التمرير للأعلى عند فتح الصفحة أو عند تغيير معرف الكتاب (id)
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  }, [id]);

  // عند انتقال المتصفح لكتاب آخر عبر الاقتراحات، نقوم بتهيئة حالة التحميل
  useEffect(() => {
    setLoadingBook(true);
  }, [routeBookId]);


useEffect(() => {
    // 1. تصفير بيانات الكتاب القديم وتفعيل التحميل
    setCurrentBook(null); 
    setLoadingBook(true); 
    setLoadingStatus(true);

    if (!routeBookId) return;

    // 🌟 خطوة سريعة: قراءة الكاش المحلي أولاً لمنع اختفاء اللون نهائياً عند الريفرش
    const cachedStatus = localStorage.getItem(`book_status_${routeBookId}`);
    if (cachedStatus) {
        setReadingStatus(cachedStatus);
        setIsBookInList(true);
    } else {
        setReadingStatus('');
        setIsBookInList(false);
    }

    // جلب بيانات المستخدم إذا لم تكن موجودة والتوكن متوفر
    if (token && !currentUserId) {
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

    // 2. جلب تفاصيل الكتاب الأساسية
    fetch(`${API_BASE_URL}/books/${routeBookId}`, { 
      headers: token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' } 
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success && resData.data) {
        const bookData = resData.data;
        setCurrentBook(bookData);
        setAverageRating(bookData.average_rating !== undefined ? Number(bookData.average_rating) : 0);
        
        if (bookData.similar_books && Array.isArray(bookData.similar_books)) {
          setSimilarBooks(bookData.similar_books);
        }

        if (bookData.ratings && Array.isArray(bookData.ratings) && bookData.ratings.length > 0 && currentUserId) {
          const userRatingObj = bookData.ratings.find(r => String(r.user_id) === String(currentUserId));
          setUserRating(userRatingObj ? Number(userRatingObj.rating) : 0);
        }
      }
    })
    .catch(err => console.error("خطأ جلب الكتاب:", err))
    .finally(() => {
      setLoadingBook(false); 
    });
// 3. جلب القائمة الكاملة من الباك إند ومزامنتها بأمان
    if (token) {
      fetch(`${API_BASE_URL}/book_list`, { 
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } 
      })
      .then(res => res.json())
      .then(listData => {
        // تفحص ذكي لنوع البيانات القادمة لمنع كسر دالة الـ .find()
        let fetchedBooks = [];
        
        if (listData) {
          if (Array.isArray(listData)) {
            fetchedBooks = listData;
          } else if (listData.data && Array.isArray(listData.data)) {
            fetchedBooks = listData.data;
          } else if (typeof listData === 'object') {
            // إذا أعاد الباك إند كائناً يحتوي على مصفوفة بداخله (مثل قاوام ترقيم الصفحات)
            fetchedBooks = Object.values(listData).find(val => Array.isArray(val)) || [];
          }
        }
        
        // الآن نضمن أننا نبحث بداخل مصفوفة حقيقية دائماً
        const currentBookInList = fetchedBooks.find(item => item && String(item.book_id) === String(routeBookId));
        
        if (currentBookInList && currentBookInList.status) {
          setReadingStatus(currentBookInList.status); 
          setIsBookInList(true); 
          localStorage.setItem(`book_status_${routeBookId}`, currentBookInList.status);
        } else {
          // نقوم بإزالة الكاش فقط إذا تأكدنا تماماً أن الكتاب ليس في القائمة والسيرفر استجاب بنجاح
          setReadingStatus(localStorage.getItem(`book_status_${routeBookId}`) || '');
        }
      })
      .catch(err => {
          console.error("فشل تحديث القوائم من السيرفر:", err);
      })
      .finally(() => {
          setLoadingStatus(false); 
      });
    } else {
      setLoadingStatus(false);
    }

}, [routeBookId, token, currentUserId]);
  // --- التوابع البرمجية للعمليات ---
const handleDeleteComment = async (commentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, { 
      method: 'DELETE', 
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Accept': 'application/json' 
      } 
    });

    if (response.ok) {
      const deleteFromRepliesRecursive = (items) => {
        return items
          .filter(item => item.id !== commentId) // احذف العنصر إذا كان هو المطلوب
          .map(item => {
            if (item.replies && item.replies.length > 0) {
              return {
                ...item,
                replies: deleteFromRepliesRecursive(item.replies) // تعمق واحذف من الأبناء
              };
            }
            return item;
          });
      };

      setComments(prev => deleteFromRepliesRecursive(prev));
    } else { 
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
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json', 
      'Accept': 'application/json' 
    },
    body: JSON.stringify({ content: replyText })
  })
  .then(res => res.json())
  .then(resData => {
    if (resData.reply) {
      // 🌿 دالة تراجع وتحدث الردود بشكل شجري متداخل مهما كان العمق
      const updateRepliesRecursive = (items) => {
        return items.map(item => {
          // إذا كان هذا العنصر هو الذي قمنا بالرد عليه مباشرة
          if (item.id === commentId) {
            return {
              ...item,
              replies: [...(item.replies || []), resData.reply]
            };
          }
          // إذا كان لديه ردود فرعية، نتأكد ونبحث بداخلها أيضاً
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: updateRepliesRecursive(item.replies)
            };
          }
          return item;
        });
      };

      setComments(prevComments => updateRepliesRecursive(prevComments));
      setActiveReplyText(''); 
      setReplyingToId(null);
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
      else {
      setAlertMessage( 'عذراً, لا يمكنك  تقييم هذا الكتاب قبل شراءة');
      setAlertOpen(true);
    }
    } catch (e) { console.error(e); }
  };

const handleStatusClick = async (targetStatus) => {
  if (!token) { alert('يرجى تسجيل الدخول أولاً.'); return; }
  setLoadingStatus(true);
  try {
    if (readingStatus === targetStatus) {
      const response = await fetch(`${API_BASE_URL}/book_list/${currentBook.id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } 
      });
      if ((await response.json()).success) { 
        setReadingStatus(''); 
        setIsBookInList(false); 
        localStorage.removeItem(`book_status_${currentBook.id}`); // إزالة الكاش عند الحذف
      }
    } else {
      const method = isBookInList ? 'PATCH' : 'POST';
      const url = isBookInList ? `${API_BASE_URL}/book_list/${currentBook.id}` : `${API_BASE_URL}/book_list`;
      const response = await fetch(url, { 
        method, 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' }, 
        body: JSON.stringify({ book_id: currentBook.id, status: targetStatus }) 
      });
      if (response.ok) { 
        setReadingStatus(targetStatus); 
        setIsBookInList(true); 
        localStorage.setItem(`book_status_${currentBook.id}`, targetStatus); // حفظ الكاش عند الإضافة/التعديل
      }
       else {
      // 🔴 فشل العملية من الباك إند (مثلاً خطأ 403 عدم شراء الكتاب)
      setAlertMessage( 'عذراً ,لايمكنك إضافة هذا الكتاب إلى قوائمك قبل إتمام عملية الشراء ');
      setAlertOpen(true);
    }
    }
  } catch (e) { 
    console.error(e); 
  } finally { 
    setLoadingStatus(false); 
  }
};
const handleAddComment = async () => {
  if (!token) { alert('يرجى تسجيل الدخول أولاً لإضافة مراجعة.'); return; }
  if (!commentText.trim()) return; // منع إرسال تعليق فارغ

  try {
    const response = await fetch(`${API_BASE_URL}/comments`, { 
      method: 'POST', 
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      }, 
      body: JSON.stringify({ book_id: currentBook.id, content: commentText }) 
    });
    
    const data = await response.json();
    
    if (response.ok) { 
      // 🟢 نجاح العملية: إضافة التعليق للقائمة وتفريغ الحقل
      setComments((prev) => [data.comment, ...prev]); 
      setCommentText(''); 
    } else {
      // 🔴 فشل العملية من الباك إند (مثلاً خطأ 403 عدم شراء الكتاب)
      setAlertMessage(data.message || 'عذراً، يجب شراء هذا الكتاب لتتمكن من إضافة مراجعة أو تعليق.');
      setAlertOpen(true);
    }
  } catch (e) { 
    console.error("خطأ أثناء إضافة التعليق:", e); 
    setAlertMessage('حدث خطأ في الاتصال بالسيرفر، يرجى المحاولة لاحقاً.');
    setAlertOpen(true);
  }
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
  // 1. أظهر الرسالة الصغيرة أسفل الشاشة
  setShowToast(true); 

  // 2. تحديث القائمة وتفريغ الحقول (كما هي في كودك الأصلي)
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
const handlePaymentCheckout = async () => {
  if (!currentBook) return;
  
  setPaymentLoading(true);
  setOpenPaymentPopup(true); // افتح واجهة الدفع

  try {
    const response = await fetch(`${API_BASE_URL}/payment/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        book_id: currentBook.id,
        amount: currentBook.price || 10.00, // السعر القادم من الباكيند أو قيمة افتراضية
        currency: 'USD',
        is_test: true // أرسليه true لتجربة الدفع الوهمي بناءً على كود الباكيند لديكِ
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setPaymentData(data.payment); // حفظ تفاصيل الدفع المستلمة
    } else {
      alert(data.message || "حدث خطأ أثناء تهيئة الدفع");
      setOpenPaymentPopup(false);
    }
  } catch (error) {
    console.error("Payment checkout error:", error);
    alert("فشل الاتصال بالسيرفر");
    setOpenPaymentPopup(false);
  } finally {
    setPaymentLoading(false);
  }
};

const handlePaymentConfirm = async () => {
  if (!paymentData) return;

  setPaymentLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/payment/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        payment_id: paymentData.id,
        status: 'succeeded'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setOpenPaymentPopup(false);
      
      // عمل تحديث لبيانات الكتاب الحالية حتى يظهر رابط الـ PDF المفتوح للمستخدم
      window.location.reload(); 
    } else {
      alert(data.message || "فشل تأكيد عملية الدفع");
    }
  } catch (error) {
    console.error("Payment confirm error:", error);
    alert("حدث خطأ أثناء التأكيد");
  } finally {
    setPaymentLoading(false);
  }
};

  return (
  <Box sx={{ bgcolor: '#f4f1ea', minHeight: '100vh', pb: 8, position: 'relative' }} dir="rtl">
    
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
        <BookInfo 
      selectedBook={{ ...currentBook, average_rating: averageRating }} 
      mainColor={mainColor} 
      handleReadClick={handleReadClick} 
      onPayClick={handlePaymentCheckout} 
    />

    {/* 💳 واجهة الدفع المنبثقة الاحترافية */}
    <Dialog 
      open={openPaymentPopup} 
      onClose={() => !paymentLoading && setOpenPaymentPopup(false)}
      PaperProps={{ sx: { borderRadius: '20px', p: 2, direction: 'rtl' } }}
    >
      <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 800, textAlign: 'center', color: mainColor }}>
        بوابة إتمام الشراء
      </DialogTitle>
      
      <DialogContent>
        {paymentLoading && !paymentData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress sx={{ color: mainColor }} />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Cairo', mb: 2 }}>
              أنت على وشك شراء كتاب: <strong>{currentBook?.title}</strong>
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: 'Cairo', fontWeight: 700, color: '#2e7d32', mb: 1 }}>
              المبلغ المطلوب: {currentBook?.price || 10.00} {paymentData?.currency || 'USD'}
            </Typography>
            {paymentData && (
              <Typography variant="caption" sx={{ fontFamily: 'Cairo', color: 'gray' }}>
                رقم الفاتورة المرجعي: {paymentData.id}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => setOpenPaymentPopup(false)} 
          disabled={paymentLoading}
          sx={{ fontFamily: 'Cairo', borderRadius: '50px', px: 3 }}
        >
          إلغاء
        </Button>
        
        <Button 
          variant="contained" 
          onClick={handlePaymentConfirm}
          disabled={paymentLoading || !paymentData}
          sx={{ 
            fontFamily: 'Cairo', 
            bgcolor: mainColor, 
            borderRadius: '50px', 
            px: 4,
            '&:hover': { bgcolor: mainColor, opacity: 0.9 }
          }}
        >
          {paymentLoading ? "جاري المعالجة..." : "تأكيد الدفع الوهمي"}
        </Button>
      </DialogActions>
    </Dialog>
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
<Snackbar 
  open={showToast} 
  autoHideDuration={3000} // ستختفي الرسالة تلقائياً بعد 3 ثوانٍ
  onClose={() => setShowToast(false)} // دالة إغلاق الرسالة
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // مكانها: أسفل المنتصف
>
  <Alert 
    severity="success" 
    variant="filled" 
    sx={{ fontFamily: 'Cairo', borderRadius: '8px' }}
  >
    تم ارسال الاقتراح بنجاح!
  </Alert>
</Snackbar>
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
      <Snackbar 
  open={alertOpen} 
  autoHideDuration={5000} 
  onClose={() => setAlertOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert 
    onClose={() => setAlertOpen(false)} 
    severity="warning" 
    variant="filled"
    sx={{ fontFamily: 'Cairo', width: '100%', borderRadius: '12px', fontWeight: 600 }}
  >
    {alertMessage}
  </Alert>
</Snackbar>
    </Box>
  );
};

export default BookDetailsPage;