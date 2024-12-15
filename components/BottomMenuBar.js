import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Select from 'react-select'
import Link from 'next/link'
import useEventListener from "@use-it/event-listener";
import { ArrowDown, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BookIcon, BookMarked, ChevronDown, ChevronDownIcon, HistoryIcon, HomeIcon, MenuIcon, SearchIcon, SettingsIcon } from "lucide-react";

var currentIdx = 0
export default function BottomMenuBar(props) {
  const [darkMode, setDarkMode] = useState(true)
  useEffect(() => {
    if (!localStorage) {return}

    if (localStorage.getItem("ANIMAPU_LITE:DARK_MODE") === "true") {
      setDarkMode(true)
    } else { setDarkMode(false) }
  }, [])

  let router = useRouter()

  const [isOpen, setIsOpen] = useState(props.isOpen || true)
  const [currentChapterIDX, setCurrentChapterIDX] = useState(0)
  const [chapters, setChapters] = useState([{ value: 'N/A', label: 'Pick Chapter' }])
  const [lastScrollTop, setLastScrollTop] = useState(0)

  const customStyles = {
    control: base => ({
      ...base,
      height: "30px",
      minHeight: "30px"
    })
  }

  useEffect(() => {
    if (!props.manga || !props.chapter_id) {return}
    if (!props.manga.chapters) {return}
    if (props.manga.chapters.length === 0) {return}
    var chapterOpts = props.manga.chapters.map((chapter, idx) => {
      if (props.chapter_id === chapter.id) {
        currentIdx = idx
      }
      return {
        value: `/mangas/${props.manga.source}/${props.manga.source_id}/read/${chapter.id}?secondary_source_id=${props.manga.secondary_source_id}`,
        label: chapter.title
      }
    })
    setChapters(chapterOpts)

  }, [props])

  useEffect(() => {
    setCurrentChapterIDX(currentIdx)
  }, [chapters])

  function checkBar() {
    if (typeof window === "undefined") { return }
  }

  useEffect(() => {
    checkBar()
  }, [])

  function handleSelectChapter(e) {
    if (!props.manga) { return "" }
    router.push(e.value)
  }

  function nextChapter() {
    if (!props.manga) { return "/#" }
    if (!chapters[currentIdx-1]) {
      return `/mangas/${props.manga.source}/${props.manga.source_id}?secondary_source_id=${props.manga.secondary_source_id}`
    }
    return chapters[currentIdx-1].value
  }

  function prevChapter() {
    if (!props.manga) { return "/#" }
    if (!chapters[currentIdx+1]) {
      return `/mangas/${props.manga.source}/${props.manga.source_id}?secondary_source_id=${props.manga.secondary_source_id}`
    }
    return chapters[currentIdx+1].value
  }

  function toManga() {
    if (!props.manga) { return "/#" }
    return `/mangas/${props.manga.source}/${props.manga.source_id}?secondary_source_id=${props.manga.secondary_source_id}`
  }

  const LEFT_KEYS = ["37", "ArrowLeft"]
  const RIGHT_KEYS = ["39", "ArrowRight"]

  var elem = ""
  if (typeof window !== "undefined") {
    elem = document
  }

  useEventListener(
    "keydown",
    ({ key }) => {
      if (LEFT_KEYS.includes(String(key))) {
        router.push(prevChapter())
      } else if (RIGHT_KEYS.includes(String(key))) {
        router.push(nextChapter())
      }
    },
    elem,
    { passive: true }
  )

  function GoToTop() {
    if (props.isRead) {
      if (!confirm("sure to go up?")) { return }
    }

    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (!props.isRead) { return }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;

      console.log("CURRENT POS", scrollTop)

      // Close state when scrolling down
      if (scrollTop > lastScrollTop) {
        setIsOpen(false);
      }

      // Open state when scrolling up
      if (scrollTop < lastScrollTop && scrollTop > 0) {
        setIsOpen(true);
      }

      setLastScrollTop(scrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  return(
    <>
      <div className={`${(props.isPaginateNavOn && props.isRead) ? "block" : "hidden"} container mx-auto pt-1 max-w-[768px]`}>
        <div className="flex justify-between">
          <Link href={prevChapter()} className="focus:text-teal-500 hover:text-teal-500 ml-1 mr-2 w-full bg-[#2b2d42] hover:bg-[#3db3f2] py-1 pr-1 rounded text-center">
            <i className="fa-solid fa-angle-left text-white"></i>
          </Link>
          <Link href={nextChapter()} className="focus:text-teal-500 hover:text-teal-500 mr-1 ml-2  w-full bg-[#2b2d42] hover:bg-[#3db3f2] py-1 pl-1 rounded text-center">
            <i className="fa-solid fa-angle-right text-white"></i>
          </Link>
        </div>
      </div>

      <div className={`w-full flex justify-center fixed inset-x-0 bottom-0 z-10`}>
        <BarManga />
      </div>
    </>
  )

  function BarManga() {
    return(
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className={`fixed ${isOpen ? "bottom-[110px]" : "bottom-[45px]"} right-4`}>
          <button
            className={`bg-[#2b2d42] bg-opacity-50 rounded-lg focus:text-teal-500 hover:bg-gray-900 py-1 px-2 ${isOpen ? "" : "hidden"}`}
            onClick={() => GoToTop()}
          >
            <ArrowUpIcon size={22} className="text-white hover:text-teal-500" />
          </button>
        </div>

        <div className="flex justify-between mx-4 mb-2">
          <div>
            <div className={`${(isOpen && props.isPaginateNavOn) ? "block" : "hidden"} bg-[#2b2d42] bg-opacity-50 py-1 px-1 rounded`}>
              <div className={`flex items-center gap-0.5`}>
                <Link href={prevChapter()} className="focus:text-teal-500 hover:text-teal-500 text-white align-middle">
                  <ArrowLeftIcon size={20} />
                </Link>
                <Link href={toManga()} className="focus:text-teal-500 hover:text-teal-500 text-white align-middle">
                  <BookIcon size={20} />
                </Link>
                {/* <Select
                  id="select manga chapter"
                  instanceId="select manga chapter"
                  options={chapters}
                  menuPlacement={"top"}
                  className="mx-2"
                  onChange={(e) => handleSelectChapter(e)}
                  defaultValue={chapters[currentIdx]}
                  value={chapters[currentIdx]}
                  styles={customStyles}
                /> */}
                <button className="text-sm py-0.5 px-2 bg-white hover:bg-gray-300 rounded flex gap-1 items-center min-w-16">
                  <span>Ch</span>
                  <span>{chapters[currentIdx].label}</span>
                  <ChevronDownIcon size={14} />
                </button>
                <Link href={nextChapter()} className="focus:text-teal-500 hover:text-teal-500 text-white align-middle">
                  <ArrowRightIcon size={20} />
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-[#2b2d42] bg-opacity-50 rounded-lg ml-1">
              <button className="focus:text-teal-500 rounded-lg hover:bg-gray-900 py-1 px-2" onClick={() => {setIsOpen(!isOpen)}}>
                <MenuIcon size={22} className="text-white hover:text-teal-500" />
              </button>
            </div>
          </div>
        </div>

        <div className={`${isOpen ? "block" : "hidden"} `}>
          <div className={`flex justify-between container mx-auto max-w-[768px] pt-2 pb-1 ${darkMode ? "dark bg-stone-950" : "bg-[#2b2d42]"} pb-2 bg-opacity-80 backdrop-blur rounded-t-lg`}>
            <Link href="/" className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] flex flex-col gap-1 items-center justify-center">
              <HomeIcon size={22} />
              <span className="tab tab-home block text-xs">Home</span>
            </Link>
            <Link href="/search" className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] flex flex-col gap-1 items-center justify-center">
              <SearchIcon size={22} />
              <span className="tab tab-home block text-xs">Search</span>
            </Link>
            <Link href="/library" className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] flex flex-col gap-1 items-center justify-center">
              <BookMarked size={22} />
              <span className="tab tab-home block text-xs">Library</span>
            </Link>
            <Link href="/history" className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] flex flex-col gap-1 items-center justify-center">
              <HistoryIcon size={22} />
              <span className="tab tab-home block text-xs">History</span>
            </Link>
            <Link href="/setting" className="w-full text-white focus:text-[#75b5f0] hover:text-[#75b5f0] flex flex-col gap-1 items-center justify-center">
              <SettingsIcon size={22} />
              <span className="tab tab-home block text-xs">Setting</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
